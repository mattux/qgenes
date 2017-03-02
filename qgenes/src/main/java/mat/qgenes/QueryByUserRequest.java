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
import java.io.File;

public class QueryByUserRequest extends Query
{
  private Request request;
  int howManyGenesFromRequest;
  int howManyConceptsFromRequest;


  public QueryByUserRequest(Request request)
  {
    this.request = request;
  }


  private String getCypherConceptsCondition()
  {
    String checkAllConcepts = request.getConcepts().get(0) +" IN e.SharedCUIs";

    for(int i = 1; i < howManyConceptsFromRequest; i++)
    {
      checkAllConcepts += " AND " + request.getConcepts().get(i) +" IN e.SharedCUIs";
    }

    return checkAllConcepts;
  }


  private String buildQuery(Request request)
  {
    String queryString = null;

    howManyGenesFromRequest = request.getGenes().size();
    howManyConceptsFromRequest = request.getConcepts().size();

    String conceptsCondition = null;

    if(howManyConceptsFromRequest >= 1)
    {
      conceptsCondition = getCypherConceptsCondition();
    }


    // ** BUILDING CYPHER QUERY **

    // zero genes
    if(howManyGenesFromRequest == 0 )
    {
      // 1 or more concepts
      if(howManyConceptsFromRequest >= 1)
      {
//        String checkAllConcepts = request.getConcepts().get(0) +" IN e.SharedCUIs";
//
//        for(int i = 1; i < howManyConceptsFromRequest; i++)
//        {
//          checkAllConcepts += " AND " + request.getConcepts().get(i) +" IN e.SharedCUIs";
//        }



        queryString = "MATCH (n:GENE)-[r:SIMILAR_TO*1.." + request.getDepth() + "]->(m:GENE) WHERE ALL(e IN r WHERE " +
                      conceptsCondition + " AND e.Weight >= " + request.getStrength() + ") RETURN n,r,m";

      }
    }

    // one gene
    if(howManyGenesFromRequest == 1 )
    {
      // zero concepts
      if(howManyConceptsFromRequest == 0)
      {
        queryString = "MATCH (n:GENE)-[r:SIMILAR_TO*1.." + request.getDepth() +"]-(m:GENE) WHERE id(n) IN [" +
                      GenesIDictionary.getInstance().getID(request.getGenes().get(0)).toString() + "] " +
                      "AND ALL(e IN r WHERE e.Weight >= " + request.getStrength() + ") RETURN n,r,m";
      }


      // 1 or more concepts
      if(howManyConceptsFromRequest >= 1)
      {
//        String checkAllConcepts = request.getConcepts().get(0) +" IN e.SharedCUIs";
//
//        for(int i = 1; i < howManyConceptsFromRequest; i++)
//        {
//          checkAllConcepts += " AND " + request.getConcepts().get(i) +" IN e.SharedCUIs";
//        }

         queryString = "MATCH (n:GENE)-[r:SIMILAR_TO*1.." + request.getDepth() + "]-(m:GENE) WHERE id(n) IN [" +
                       GenesIDictionary.getInstance().getID(request.getGenes().get(0)).toString() + "] " +
                       "AND ALL(e IN r WHERE " + conceptsCondition + " AND e.Weight >= " + request.getStrength() + ") " +
                       "RETURN n,r,m";
      }
    }


    // 2 or more genes
    if(howManyGenesFromRequest > 1 )
    {
      // zero concepts
      if(howManyConceptsFromRequest == 0)
      {
        queryString = "MATCH (n:GENE)-[r:SIMILAR_TO*0.." + request.getDepth() +"]-(m:GENE) WHERE id(n) IN " +
                      GenesIDictionary.getInstance().getIDList(request.getGenes()).toString() + " AND id(m) IN " +
                      GenesIDictionary.getInstance().getIDList(request.getGenes()).toString() + " AND ALL(e IN r WHERE e.Weight >= " +
                      request.getStrength() + ") AND id(n)<>id(m) RETURN n,r,m";



       System.out.println(queryString);
      }



      // 2 or more concepts
      if(howManyConceptsFromRequest >= 1)
      {
//        String checkAllConcepts = request.getConcepts().get(0) +" IN e.SharedCUIs";
//
//        for(int i = 1; i < howManyConceptsFromRequest; i++)
//        {
//          checkAllConcepts += " AND " + request.getConcepts().get(i) +" IN e.SharedCUIs";
//        }

         queryString = "MATCH (n:GENE)-[r:SIMILAR_TO*0.." + request.getDepth() + "]-(m:GENE) WHERE id(n) IN " +
                       GenesIDictionary.getInstance().getIDList(request.getGenes()).toString() +" AND id(m) IN " +
                       GenesIDictionary.getInstance().getIDList(request.getGenes()).toString() + " AND ALL(e IN r WHERE " +
                       conceptsCondition + " AND e.Weight >= " + request.getStrength() + ") AND id(n)<>id(m) " +
                       "RETURN n,r,m";

      }
    }



      System.out.println(queryString);
      return queryString;
  }


  public String queryDB()
  {
    String response = super.sendQuery(buildQuery(request), true);
    return response;
  }

}
