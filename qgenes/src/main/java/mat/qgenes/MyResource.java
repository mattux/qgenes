package mat.qgenes;

import javax.ws.rs.Consumes;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.List;
import java.util.ArrayList;


/**
 * Root resource
 */
@Path("/")
public class MyResource {

    @GET
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public String getResponse(@QueryParam("data") String req)
    {
      String resp;

      resp = "{ \"servererror\" : { \"code\" : 313,  \"message\" : \"The service seems working, check your request: " + req + "\" } }";

      UserRequestParser urp = new UserRequestParser(req);
      Request parsedRequest = urp.parseUserRequest();

      if(parsedRequest.getGenes().size() > 0 || parsedRequest.getConcepts().size() > 0)
      {
        QueryByUserRequest query = new QueryByUserRequest(parsedRequest);
        resp = query.queryDB();
      }
      else
      {
        resp = "{ \"servererror\" : { \"code\" : 1, \"message\" : \"Empty Request\" } }";
      }

      return resp;
    }
}
