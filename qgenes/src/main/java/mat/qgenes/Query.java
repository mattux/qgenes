package mat.qgenes;

import java.net.URI;
import java.net.URISyntaxException;
import javax.ws.rs.core.MediaType;
import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientHandlerException;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.UniformInterfaceException;
import com.sun.jersey.api.client.WebResource;
import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.logging.FileHandler;
import java.util.logging.ConsoleHandler;
import java.util.logging.Formatter;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.logging.SimpleFormatter;
import java.io.File;

public abstract class Query
{
  private static final String SERVER_ROOT_URI = "http://localhost:7474/db/data/";
  private String queryResult;
  public abstract String queryDB();


  protected String sendQuery(String query, Boolean graphMode)
  {

    try
    {
      final String txUri = SERVER_ROOT_URI + "transaction/commit";
      WebResource resource = Client.create().resource(txUri);

      String visualizationMode = "row";

      if(graphMode)
      {
        visualizationMode = "graph";
      }

      String payload = "{\"statements\" : [ {\"statement\" : \"" + query + "\"" +  ", \"resultDataContents\" : [ \"" + visualizationMode + "\" ]" + "} ]}";
      ClientResponse response = resource
          .accept( MediaType.APPLICATION_JSON )
          .type( MediaType.APPLICATION_JSON )
          .entity( payload )
          .post( ClientResponse.class );


      queryResult = response.getEntity( String.class );

      System.out.println("\n### QUERY " + payload + "\n###");

      response.close();

      return queryResult;

    }
    catch(UniformInterfaceException | ClientHandlerException e)
    {
      return "{\"Error\" : \"" + e + "\" }";
    }
  }


}
