package mat.qgenes;

import java.net.URI;
import java.net.URISyntaxException;
import javax.ws.rs.core.MediaType;
import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientHandlerException;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.UniformInterfaceException;
import com.sun.jersey.api.client.WebResource;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;
import java.util.Arrays;
import java.util.HashMap;
import java.io.File;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;
import com.jayway.jsonpath.JsonPath;


@WebListener
public class ApplicationStartUpListener implements ServletContextListener
{
  //public static Connection con;

  @Override
  public void contextInitialized(ServletContextEvent event)
  {
    //System.out.println("---- initialize servlet context -----");
    //con.getInstance ();

    // assuming that the db server is up
    QueryGenesID gid = new QueryGenesID();
    String gidJSON = gid.queryDB();

    ArrayList<String> genesNamesFromJSON = JsonPath.read(gidJSON, "$.results[0].data[*].row[0]");
    ArrayList<Integer> genesIDsFromJSON = JsonPath.read(gidJSON, "$.results[0].data[*].row[1]");

    for(int i = 0; i < genesNamesFromJSON.size(); i++)
    {
       GenesIDictionary.getInstance().addElement(genesNamesFromJSON.get(i), genesIDsFromJSON.get(i));
    }

  }


  @Override
  public void contextDestroyed(ServletContextEvent event)
  {
    //System.out.println("---- destroying servlet context -----");
    //~ con.close ();
  }

}
