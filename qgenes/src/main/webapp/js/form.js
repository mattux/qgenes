function buildJSONArrayOfString(str)
{
  var jsonStringArray = "[";
  var i = 1;

  for (var s in str)
  {
    jsonStringArray += "\"" + str[s] + "\"";

    if(i < str.length)
    {
      jsonStringArray += ", ";
    }

    i++;
  }

  jsonStringArray += "]";

//  console.log(jsonStringArray);

  return jsonStringArray;
}


function buildJSONRequest()
{
  /*  JSON structure
   *  ==============
   *
   *  {
   *      Genes: ["", "", ... , ""],
   *      Concepts: ["", "", ..., ""],
   *      Strength: ,
   *      Depth:
   *  }
   *
   */

  QgenesRequest.setQueryDepth($("div#depth > input[type=\"hidden\"]").val());
  QgenesRequest.setRelationStrength($("div#strength > input[type=\"hidden\"]").val());

  var request = "{ \"Genes\" : " + buildJSONArrayOfString(QgenesRequest.genes) + ", " +
                "\"Concepts\" : " + buildJSONArrayOfString(QgenesRequest.concepts) + ", " +
                "\"Strength\" : " + parseFloat(QgenesRequest.relationStrength) + ", " +
                "\"Depth\" : " + parseInt(QgenesRequest.queryDepth) + " }";

  return request;
}


function submitForm()
{
  $("form").submit(
    function()
    {
      if(QgenesRequest.genes.length > 0 || QgenesRequest.concepts.length > 0)
      {
        showLoading();
        $("#requestpage-container").fadeOut();

        var formdata = buildJSONRequest();
        console.log(formdata);
          $('input[name="data"]').val(formdata);
        jsondata = $('input[name="data"]').serialize();
        console.log(jsondata);

        var destination = window.location.href + "search";
        console.log(destination);

        $.ajax(
          {
            type: "GET",
            url: destination,
            data: jsondata,
            dataType: "json",
            processData: "false",

            success: function(data)
            {
              // console.log(JSON.stringify(data));

              /* GRAPH */
              if(checkResponse(data) === true)
              {
                console.log("I have found relationships! I'm going to draw the network...'");
                hideLoading();
                $("#resultpage-container").fadeIn();
                $(".netview-menu-entry").css({"display" : "block"});
                $(".request-menu-entry").css({"display" : "none"});
                drawGraph();
              }
              else
              {
                hideLoading();
                $("#requestpage-container").fadeIn();
                makeAlertNotFound();
              }
            },
            error: function(data)
            {
              hideLoading();
              $("#requestpage-container").fadeIn();
              console.log("ERROR");
              console.log(data);
              console.log(jsondata);
              console.log(destination);
            }
          });

          return false;

      }
    }
  );
}


function genesAutocomplete()
{
  $("#genes-input").tagit({

    // Options
    fieldName: "genes-input",
    availableTags: genesList,
    autocomplete: {delay: 0, minLength: 2},
    showAutocompleteOnFocus: false,
    removeConfirmation: false,
    caseSensitive: true,
    allowDuplicates: false,
    allowSpaces: false,
    readOnly: false,
    tagLimit: null,
    singleField: true,
    singleFieldDelimiter: ';',
    singleFieldNode: '',
    tabIndex: null,
    placeholderText: 'Insert a list of genes',

    // Events
    beforeTagAdded: function(event, ui)
    {
        //console.log(ui.tag);
        if($.inArray(ui.tagLabel, genesList) == -1)
        {
          return false;
        }
    },
    afterTagAdded: function(event, ui)
    {
        //console.log(ui.tag);
        $("#request-genes-counter").html($("#genes-input").tagit("assignedTags").length);
        QgenesRequest.addGenes(ui.tagLabel);
        $("#submit").removeAttr("disabled");
    },
    beforeTagRemoved: function(event, ui)
    {
        QgenesRequest.removeGene(ui.tagLabel);

        //~ console.log(ui.tag);
        if($("#genes-input").tagit("assignedTags").length > 0)
        {
          $("#request-genes-counter").html($("#genes-input").tagit("assignedTags").length-1);
        }

        if($("#genes-input").tagit("assignedTags").length == 1 &&
        $("#concepts-input").tagit("assignedTags").length == 0)
        {
             $("#submit").attr("disabled", "disabled");
        }

    }
  });
}


function conceptsAutocomplete()
{
  $("#concepts-input").tagit({

    // Options
    fieldName: "concepts-input",
    availableTags: labelsList,
    autocomplete:
    {
      delay: 0, minLength: 3,
      position: { collision: "flip" }
    },
    // overriding function to modify autocomplete behavior
    tagSource: function(search, showChoices) {
        var filter = search.term.toLowerCase();
        var choices = $.grep(this.options.availableTags, function(element) {
            return (element.toLowerCase().match(filter) !== null);
        });
        showChoices(this._subtractArray(choices, this.assignedTags()));
    },
    showAutocompleteOnFocus: false,
    removeConfirmation: false,
    caseSensitive: true,
    allowDuplicates: false,
    allowSpaces: true,
    readOnly: false,
    tagLimit: null,
    singleField: true,
    singleFieldDelimiter: ';',
    singleFieldNode: '',
    tabIndex: null,
    placeholderText: 'Insert a list of concepts',

    // Events
    beforeTagAdded: function(event, ui)
    {
      //console.log(ui.tag);
      if($.inArray(ui.tagLabel, labelsList) == -1)
      {
        return false;
      }
    },
    afterTagAdded: function(event, ui)
    {
      QgenesRequest.addConcepts(labelsCUIAssociationList[ui.tagLabel]);
      //console.log(labelsCUIAssociationList[ui.tagLabel]);

      $("#submit").removeAttr("disabled");
      $("#request-concepts-counter").html($("#concepts-input").tagit("assignedTags").length);
    },
    beforeTagRemoved: function(event, ui)
    {
      for(var i=0; i<labelsCUIAssociationList[ui.tagLabel].length; i++)
      {
        QgenesRequest.removeConcept(labelsCUIAssociationList[ui.tagLabel][i]);
      }

      if($("#concepts-input").tagit("assignedTags").length > 0)
      {
        $("#request-concepts-counter").html($("#concepts-input").tagit("assignedTags").length-1);
      }

      if($("#concepts-input").tagit("assignedTags").length == 1 &&
        $("#genes-input").tagit("assignedTags").length == 0)
      {
        $("#submit").attr("disabled", "disabled");
      }
    }
  });
}