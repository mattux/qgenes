package mat.qgenes;

public class QueryGenesID extends Query
{
  public QueryGenesID()
  {

  }


  public String queryDB()
  {
    String queryString = "MATCH (n:GENE) return n.Name, id(n)";
    String result = super.sendQuery(queryString, false);

    System.out.println(queryString);

    return result;
  }
}
