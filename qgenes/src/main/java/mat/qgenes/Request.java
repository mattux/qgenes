package mat.qgenes;

import java.util.ArrayList;
public class Request
{
  private final ArrayList<String> genes;
  private final ArrayList<String> concepts;
  private final float strength;
  private final int depth;


  public Request(ArrayList<String> g, ArrayList<String> c, float s, int d)
  {
    this.genes = g;
    this.concepts = quoteArrayListElements(c);
    this.strength = s;
    this.depth = d;
  }

  public ArrayList<String> getGenes()
  {
    return this.genes;
  }

  public ArrayList<String> getConcepts()
  {
    return this.concepts;
  }

  public float getStrength()
  {
    return this.strength;
  }

  public int getDepth()
  {
    return this.depth;
  }


  private ArrayList<String> quoteArrayListElements(ArrayList<String> list)
  {
    for (int s=0; s < list.size(); s++)
     {
         list.set(s, "'" + list.get(s) + "'");
     }

     return list;
  }

}
