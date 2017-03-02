package mat.qgenes;

import java.util.HashMap;
import java.util.ArrayList;

public class GenesIDictionary
{
  private HashMap<String, Integer> dictionary = new HashMap<String, Integer>();
  private static final GenesIDictionary instance = new GenesIDictionary();

  private GenesIDictionary()
  {
  }


  public static GenesIDictionary getInstance()
  {
    return instance;
  }


  public void addElement(String gene, Integer ID)
  {
    dictionary.put(gene, ID);
  }


  public Integer getID(String geneName)
  {
    return dictionary.get(geneName);
  }


  public ArrayList<Integer> getIDList(ArrayList<String> geneNameList)
  {
    ArrayList<Integer> idsList = new ArrayList<>();

    for(String s: geneNameList)
    {
      idsList.add(dictionary.get(s));
    }

    return idsList;
  }


  public void print()
  {
    for (String name: dictionary.keySet())
    {
      String key = name.toString();
      String value = dictionary.get(name).toString();
      System.out.print("( "+ key + ", " + value + " )\t");
    }

  }
}
