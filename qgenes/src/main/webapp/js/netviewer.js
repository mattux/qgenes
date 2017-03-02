// --------------------- GLOBAL VARIABLES ---------------------

// arrays for the vis.js graph
var nodes = [];
var edges = [];

// I instantiate the vis.js graph on this variable
var network;

// it contains the graph data, ready for the istantiation
var graph;

// options of the graph
var options;

// the response of Neo4j
var neo4jResponse;

// arrays that contains information of nodes and edges
var nodesArray = new Array();
var edgesArray = new Array();




// ----------- LABELS-CUI ASSOCIATIONS FUNCTIONS -----------

// cuis is an array
function labelsFromCUIs(cuis)
{
  var lca = {};
  var label;

  for (var c in cuis)
  {
    label = cuiLabelsAssociationList[cuis[c]];

    //~ console.log(label);

    if(lca.hasOwnProperty(label))
    {
      lca[label] = lca[label].concat(cuis[c]);
    }
    else
    {
      lca[label] = [];
      lca[label] = lca[label].concat(cuis[c]);
    }

    //~ console.log(lca);
  }

  return lca;
}


/*
 *  lca -> label-cui associations
 *  lca is what the function 'labelsFromCUIs()' returns
 *
 *  Every label is showed as link with a tooltip showing associated cuis
 *  return a String
*/

// request is a boolean flag: true -> request | false -> info sidebar
function lcaPrettyPrint(lca, request)
{
  var type = "infobox";
  var tipDirection = "left"

  if(request === true)
  {
    type= "req"
    tipDirection = "bottom"
  }
  var prettyPrinted = '<ul class="' + type +'-concepts-pretty-print">';
  var cuis;

  for (var c in lca)
  {
    cuis = lca[c].toString();
    cuis = cuis.replace(/,/g, ", ");
    prettyPrinted += '<li><a id="c-t-' + tipDirection +'-' + c + '" class="has-tip tip-' + tipDirection +' netviewer" data-selector data-tooltip aria-haspopup="true" title="' + cuis +'">' + c +'</a></li>';
  }

  prettyPrinted += "</ul>";

  return prettyPrinted;
}


// ------------------------- GRAPH FUNCTIONS -------------------------

// if a node is member of the request, returns 'request' else returns 'query'
function nodeGroup(id)
{
  var group = 'query';

  if(QgenesRequest.genes.indexOf(nodesArray[id].name) !== -1)
  {
      group = 'request';
  }

  return group;
}


// it parses the Neo4j response and build the graph
function buildGraph(dataFromJSON)
{
  //~ var jsonobj = JSON.parse(response);
  //~ var dataFromJSON = jsonobj.results[0].data;


  // cycling over the Neo4j response
  for(var n in dataFromJSON)
  {
    //********************* CREATING NODES *********************

    // list of the current nodes object from the Neo4j response
    // nList[i].id -> it's the "id" attached by Neo4j, it's not the gene's Entrez ID
    nList = dataFromJSON[n].graph.nodes;

    for(var i in nList)
    {
      var found = false;

      // searching if already exists the node in "nodes" (vis.js)
      for(item in nodes)
      {
        var target = nodes[item];

        if(target['id'] === nList[i].id)
        {
          found = true;
        }
      }

        // if the node doesn't already exist
        if(!found)
        {
          // adding all the info of the new node to "nodesArray"
          nodesArray[nList[i].id] = {gid: nList[i].properties.GID, name: nList[i].properties.Name, BagOfCUIs: nList[i].properties.BagOfCUIs, summary: nList[i].properties.Summary};

        // creating the entry for the graph
          var group = nodeGroup(nList[i].id);
          entry = {id: nList[i].id, label: nList[i].properties.Name, group: group};

          // adding the node to the graph
          nodes = nodes.concat(entry);

        }

    }


    //********************* CREATING EDGES *********************

    // list of the current nodes object from the Neo4j response
    var rList = dataFromJSON[n].graph.relationships;

    // cycling over the Neo4j response
    for(var i in rList)
    {
      var found = false;

      // searching if already exists the edge in "edges" (vis.js)
      for(item in edges)
      {
        var target = edges[item];

        if(target['from'] === rList[i].startNode && target['to'] === rList[i].endNode ||
                target['from'] === rList[i].endNode && target['to'] === rList[i].startNode)
        {
          found = true;
        }
      }

      // if the edge doesn't already exist
      if(!found)
      {
        // creating the entry for the graph
        var entry = {id: rList[i].id, from: rList[i].startNode, to: rList[i].endNode, value: rList[i].properties.Weight, title: rList[i].properties.Weight.toPrecision(2).toString()};

        // adding the edge to the graph
        edges = edges.concat(entry);

         // adding all the info of the new edge to "nodesArray"
        edgesArray[rList[i].id] = {from: rList[i].startNode, to: rList[i].endNode, sharedCUIs: rList[i].properties.SharedCUIs, weight: rList[i].properties.Weight.toString()};
      }

    }

  }

  // defining the graph
  var data= {
    nodes: nodes,
    edges: edges
  };

  // returning the graph
  return data;
}


function checkResponse(data)
{
  // the Neo4j Response in String format
  neo4jResponse = JSON.stringify(data);

  var jsonobj = JSON.parse(neo4jResponse);
  var dataFromJSON = jsonobj.results[0].data;

  var relFound = true;

  if(dataFromJSON.length === 0)
  {
    relFound = false;
  }

  // building the graph
  if(relFound === true)
  {
    drawGraph(dataFromJSON);
    return true;
  }
  else
  {
    return false;
  }
}


function drawGraph(data)
{

  graph = buildGraph(data);


  // redraw the network in case of window resizing
  $(window).resize
  (
    function()
    {
      network.redraw();
      network.zoomExtent();
    }
  );

  // graphic options of the graph
  options = {
    hideEdgesOnDrag: true,
    stabilizationIterations: 300,
    keyboard: {
      speed: {
        x: 10,
        y: 10,
        zoom: 0.02
      },
      bindToWindow: true
    },
    nodes: {
      shape: 'dot',
      borderWidth: 2,
      borderWidthSelected: 2,
      radius: 12,
      fontColor: '#000000',
      fontSize: 16,
      fontFace: 'Fira Mono',
      fontsSrokeWidth: 2,
      fontStrokeColor: '#ffffff'
    },
    edges: {
      widthSelectionMultiplier: 1.5,
      fontColor: '#000000',
      fontSize: 16,
      fontFace: 'Fira Mono',
      widthMin: 1,
      widthMax: 6,
      color: {
        color: '#A8BBCF',
        hover: '#A8BBCF',
        highlight: '#006270'
      }
    },
    physics: {
      enabled: true,
      barnesHut: {
        gravitationalConstant: -2600,
        centralGravity: 0.5,
        springLength: 40,
        springConstant: 0.05,
        damping: 0.3
      }
    },
    clustering: {
      initialMaxNodes: 100,
      clusterThreshold:50,
      reduceToNodes:300,
      chainThreshold: 0.4,
      clusterEdgeThreshold: 20,
      sectorThreshold: 100,
      screenSizeThreshold: 0.2,
      fontSizeMultiplier:  4.0,
      maxFontSize: 1000,
      forceAmplification:  0.1,
      distanceAmplification: 0.1,
      edgeGrowth: 20,
      nodeScaling: {
        width:  1,
        height: 1,
        radius: 1
       },
       maxNodeSizeIncrements: 600,
       activeAreaBoxSize: 100,
       clusterLevelDifference: 5,
       clusterByZoom: true
    },
    groups: {
      query : {
        fontColor: '#222222',
        fontSize: 16,
        fontFace: 'Fira Mono',
        fontStrokeWidth: 2,
        fontStrokeColor: '#FFFFFF',

        color: {
          background: '#FFB8A8',
          border: '#D17E6D',
          hover: {
            background: '#AC2860',
            border: '#700030'
          },
          highlight: {
            background: '#AC2860',
            border: '#700030'
          }
        }
      },
      request: {
        fontColor: '#222222',
        fontSize: 20,
        fontFace: 'Fira Mono',
        radius: 16,
        fontStrokeWidth: 2,
        fontStrokeColor: '#FFFFFF',

        color: {
          background: '#FE8A71',
          border: '#D0644E',
          hover: {
            background: '#AC2860',
            border: '#700030'
          },
          highlight: {
            background: '#AC2860',
            border: '#700030'
          }
        }
      }
    }
  };


  // **** instantiating the graph *****
  var container = document.getElementById('netviewer-graph');
  network = new vis.Network(container, graph, options);
  // **********************************

// show the relations related to the selected node
function showNodeRelations(id)
{
  var jsonobj = JSON.parse(neo4jResponse);
  var net = jsonobj.results[0].data;

  var destNodeID;
  var destNodeGID;
  var weight;
  var destNodeName;
  var thisNodeName = nodesArray[id].name;

  // relations of the current node [destination, weight]
  var relationList = [];


  $('li#' + thisNodeName + '> div').append('<span class="title">In relationship with</span>');

  // cycling over the edges list
  for(var rel in edgesArray)
  {

    // reset the variable is necessary
    destNodeID = -1;

    // the selected node could be the head or the tail of the edge
    if(edgesArray[rel].from === id.toString())
    {
      destNodeID = edgesArray[rel].to;
    }
    // I take the other node
    else
    {
      if(edgesArray[rel].to === id.toString())
      {
        destNodeID = edgesArray[rel].from;
      }
    }

    // if I find a node
    if(destNodeID !== -1)
    {
      destNodeGID = nodesArray[destNodeID].gid;
      destNodeName = nodesArray[destNodeID].name;
      weight = edgesArray[rel].weight;

      // adding the infos of the found relation to the array
      relationList.push({dest: destNodeName, weight: weight});
    }

    // console.log(relationList);
  }

  // sorting the array
  relationList.sort(function(a, b)
  {
    a = a.weight;
    b = b.weight;

    return a < b ? -1 : (a > b ? 1 : 0);
  });

  // grid
  $('li#' + thisNodeName + '> div').append('<div class="in-relation-with" id="' + thisNodeName +'-relations">');

  for(var item = relationList.length - 1; item >= 0; item--)
  {
    var dest = relationList[item].dest.toUpperCase();
    $('div#' + thisNodeName + '-relations').append('<div id="' + thisNodeName +'-' + dest +'-rel" class="row rel-to" style="margin-bottom:0;">');
    $('div#' + thisNodeName + '-relations > div#' + thisNodeName +'-' + dest +'-rel').append('<div class="small-6 columns" style="margin-bottom:0;"><span class="rel-to-name" title="click to show ' + dest + ' properties">' + dest +'</span></div>');
    $('div#' + thisNodeName + '-relations > div#' + thisNodeName +'-' + dest +'-rel').append('<div class="small-6 columns" style="margin-bottom:0;"><span>' + relationList[item].weight +'</span></div>');
    $('div#' + thisNodeName + '-relations').append('</div>');
  }

  $('li#' + thisNodeName + '> div').append('</div>');
  
  
  $(".rel-to-name").click(function()
  {
    var id = -1;

    for (i in nodes)
    {
      if(nodes[i].label == $(this).text())
      {
        id = parseInt(nodes[i].id);
        break;
      }
     }

     $('ul.accordion').empty();
     network.selectNodes([id])
     showNodeProperties([id]);

  });

}

// shows the properties of the selected node in the info box
function showNodeProperties(id)
{
//  console.log(neo4jResponse);
  var jsonobj = JSON.parse(neo4jResponse);
  var net = jsonobj.results[0].data;

  // retrieving the properties of the node
  var gid = nodesArray[id].gid;
  var name = nodesArray[id].name;
  var boc = nodesArray[id].BagOfCUIs    ;
  var summary = nodesArray[id].summary;
  var cs = labelsFromCUIs(boc);


// showing the node's info
  $("#info-area").append('<li class="accordion-navigation node" id="' + name + '"><a class="node" href="#' + name +'">' + name + '</a><div id="' + name + '" class="content active" ><div><span class="title">Entrez ID</span><span>' + gid + '</span></div><div><span class="title">Summary</span><span>' + summary + '</span></div><div><span class="title">Related Concepts</span><span>' + lcaPrettyPrint(cs, false) + '</span></div></div></li>');

  // Reflow will make Foundation check the DOM for any elements and re-apply any listeners to them.
  $(document).foundation('tooltip', 'reflow');

  // showing the relations related to the selected node
  showNodeRelations(id);
}


function showEdgeProperties(id)
{
  var jsonobj = JSON.parse(neo4jResponse);
  var net = jsonobj.results[0].data;

  var from = edgesArray[id].from;
  var to = edgesArray[id].to;
  var sharedCUIs = edgesArray[id].sharedCUIs;
  var weight = edgesArray[id].weight;
  var cs = labelsFromCUIs(sharedCUIs);

  showNodeProperties(from);
  showNodeProperties(to);

  $('.content').addClass('rel');


  $('li.accordion-navigation.node > div').removeClass("active");

  $("#info-area").append('<li class="accordion-navigation edge"><a class="edge" href="#relazione">Relationship</a><div id="relazione" class="content active"><div><span class="title">Strength</span><span>' + weight + '</span><span class="title">Related Concepts</span><span>' + lcaPrettyPrint(cs, "false") + '</span></div></div></li>');

  // Reflow will make Foundation check the DOM for any elements and re-apply any listeners to them.
  $(document).foundation('tooltip', 'reflow');
}


function printGraphInfo()
{
  $("#nodes-num").html('<span class="graph-info-counter">' + nodes.length + "</span> Genes");
  $("#relationships-num").html('<span class="graph-info-counter">' + edges.length + "</span> Relations");
}


//****************** SCATTERED CODE ******************
  $("#new-search, #edit-search").click(
    function()
    {
      // destroys the graph
      network.destroy();
      nodes = [];
      edges = [];
      nodesArray = [];
      edgesArray = [];
    });

  $("#center-net-view").click(
    function()
    {
      //~ network.zoomExtent({ duration: 300, easingFunction: 'easeOutQuint' });
      network.zoomExtent();

    });


  network.on('click',
    function (properties)
    {
      $("#netviewer-hint").hide();
      $("#info-area").show();

      if(properties.nodes.length > 0)
      {
        $('.content').removeClass('rel');
        $('ul.accordion').empty();
        showNodeProperties(properties.nodes[0]);
      }

      if(properties.edges.length > 0  && properties.nodes.length === 0)
      {
        $('ul.accordion').empty();
        showEdgeProperties(properties.edges[0]);
      }
      if(properties.edges.length === 0  && properties.nodes.length === 0)
      {
        $('ul.accordion').empty();
        $("#netviewer-hint").show();
        $("#info-area").hide();
      }
    }
  );


  printRequestInfo();
  printGraphInfo();


}


// request infos
function printRequestInfo()
{
  $("#request-info #strength-request > .r-info").html('<li class="req-info-type"><span class="strength-header">S</span></li>');
  $("#request-info #depth-request > .r-info").html('<li class="req-info-type"><span class="depth-header">D</span></li>');
  $("#request-info #genes-request > .r-info").html('<li class="req-info-type"><span class="genes-header">G</span></li>');
  $("#request-info #concepts-request > .r-info").html('<li class="req-info-type"><span class="concepts-header">C</span></li>');

  if(QgenesRequest.genes.length > 0)
  {
    $("#request-info #genes-request").show();
    $("#request-info #genes-request > .r-info").append('<li>' + QgenesRequest.genes.toString().replace(/,/g, ", ") + '</li>');
  }
  else
  {
    $("#request-info #genes-request").hide();
  }

  if(QgenesRequest.concepts.length > 0)
  {
    $("#request-info #concepts-request").show();
    $("#request-info #concepts-request > .r-info").append('<li>' + lcaPrettyPrint(labelsFromCUIs(QgenesRequest.concepts), true) + '</li>');
    $(document).foundation('tooltip', 'reflow');
  }
  else
  {
    $("#request-info #concepts-request").hide();
  }

  $("#request-info #strength-request > .r-info").append("<li>&ge; " + QgenesRequest.relationStrength.toString() + "</li>");
  $("#request-info #depth-request > .r-info").append("<li>&le; " + QgenesRequest.queryDepth.toString()) + "</li>";

}
