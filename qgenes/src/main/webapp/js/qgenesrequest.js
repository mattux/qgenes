var QgenesRequest = QgenesRequest || {};

QgenesRequest =
{
  genes: [],
  concepts: [],
  relationStrength: "",
  queryDepth: "",

  setRelationStrength: function(strength)
  {
    this.relationStrength = strength;
  },

  setQueryDepth: function(depth)
  {
     this.queryDepth = depth;
  },

  addGenes: function(g)
  {
    this.genes = this.genes.concat(g);
  },

  addConcepts: function(c)
  {
    this.concepts = this.concepts.concat(c);
  },

  setGenes: function(g)
  {
    this.genes = []
    this.addGenes(g);
  },

  setConcepts: function(c)
  {
    this.concepts = []
    this.addConcepts(c);
  },

  removeGene: function(g)
  {
    this.genes.splice(this.genes.indexOf(g), 1);
  },

  removeConcept: function(c)
  {
    this.concepts.splice(this.concepts.indexOf(c), 1);
  },

  reset: function()
  {
    this.genes = [];
    this.concepts = [];
    this.queryDepth = "";
    this.relationStrength = "";
  }

};
