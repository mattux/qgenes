package mat.qgenes;

import com.eclipsesource.json.*;
import java.util.ArrayList;

public class UserRequestParser
{
  private final String userRequest; // the request is a JSON

  public UserRequestParser(String userRequest)
  {
    this.userRequest = userRequest;
  }

  public Request parseUserRequest()
  {
    JsonObject jsonobject = JsonObject.readFrom(userRequest);

    JsonArray genesArray = jsonobject.get("Genes").asArray();
    JsonArray conceptsArray = jsonobject.get("Concepts").asArray();

    ArrayList<String> genes = new ArrayList<>();
    ArrayList<String> concepts = new ArrayList<>();

    for(JsonValue elem: genesArray)
    {
      genes.add(elem.asString());
    }

    for(JsonValue elem: conceptsArray)
    {
      concepts.add(elem.asString());
    }

    float strength = jsonobject.get("Strength").asFloat();
    int depth = jsonobject.get("Depth").asInt();

    Request req = new Request(genes, concepts, strength, depth);

//    log.log( Level.FINE, "request parsed: ", genesArray.size() );
    System.out.println(req.getGenes());
    System.out.println(req.getConcepts());
    System.out.println(req.getStrength());
    System.out.println(req.getDepth());

    return req;
  }



}
