package mat.qgenes;

import java.util.ArrayList;
import com.eclipsesource.json.*;


public class QueryGenesIDictionaryBuilder
{
  private String gidJSON;

  public QueryGenesIDictionaryBuilder(String gj)
  {
    this.gidJSON = gj;
  }

  public void build()
  {
    JsonObject jsonobject = JsonObject.readFrom(gidJSON);
    JsonArray gidData = jsonobject.get("data").asArray();
  }

}
