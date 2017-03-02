function getCUIs(label)
{
  var cuis = [];

  for (var c in cuiLabelsAssociationList)
  {
    if (cuiLabelsAssociationList[c] == label)
    {
      cuis.push(c);
    }
  }

  return cuis;
}


function showLoading()
{
//  $("#requestpage-container").fadeOut();
  $("div.loading").fadeIn();
  $("#sidebar").hide();
}

function hideLoading()
{
  $("div.loading").fadeOut();
  $("#sidebar").show();
}


function makeAlertNotFound()
{
  $("body").append('<div id="no-rel-found" data-alert class="alert-box warning" tabindex="0" aria-live="assertive" role="dialogalert"><p>I did not found any relationship</p><button href="#" tabindex="0" class="close" aria-label="Close Alert">&times;</button></div>');

  $('#no-rel-found').show();

  $(document).foundation('alert', 'reflow');
}


//RESET SLIDERS
function resetRequestSliders()
{
  //position
  var p = parseFloat($(".sldrs").width()/2) - parseFloat(($(".range-slider.vertical-range").width() / 2));
  $(".range-slider.vertical-range").css("margin-left", p);
}


/* SCATTERED CODE */
$("#new-search").click(
  function()
  {
    $("#resultpage-container").fadeOut();

    // request reset
    QgenesRequest.reset();

    $("#requestpage-container").fadeIn();

    // emptying the info-area
    $("#info-area").empty();

    // the info-area-hint should be visible again
    $("#netviewer-hint").show();

    // clearing the tag areas
    $("#genes-input").tagit("removeAll");
    $("#concepts-input").tagit("removeAll");

    // sidebar button
    $(".request-menu-entry").css({"display" : "block"});
    $(".netview-menu-entry").hide();

    $(".loading").hide();

    $(".request-menu-entry").css({"display" : "block"});
  });

$("#edit-search").click(
  function()
  {
    $(".qgenes-error").hide();


    $("#resultpage-container").fadeOut();
    $("#requestpage-container").fadeIn();

    $(".netview-menu-entry").hide();
    $(".request-menu-entry").css({"display" : "block"});

     // emptying the info-area
    $("#info-area").empty();

    // the info-area-hint should be visible again
    $("#netviewer-hint").show();

    // request reset
    //QgenesRequest.reset();

    // repositioning sliders
    resetRequestSliders();
  });



/*
 *  SHOW & HIDE GENES-CONCEPTS TEXT AREAS
 */

var genesTxtIsOpened = true;
var conceptsTxtIsOpened = true;

$("#add-genes").click(
  function()
  {
    if(genesTxtIsOpened === true && conceptsTxtIsOpened === true)
    {
      // CLOSE GENES TXT AREA
      $("#g-list:visible").hide('blind', { easing: "swing" }, 500, function() { genesTxtIsOpened = false });
      $("#add-genes > i").removeClass("fi-minus");
      $("#add-genes > i").addClass("fi-plus");
      $("#c-list ul.tagit").addClass("tagit-big");
      $("#genes-input").tagit("removeAll");
      QgenesRequest.genes = [];
    }

    if(genesTxtIsOpened === false)
    {
      // OPEN GENES TXT AREA
      $("#g-list:hidden").show('blind', { easing: "swing" }, 500, function() { genesTxtIsOpened = true });
      $("#add-genes > i").removeClass("fi-plus");
      $("#add-genes > i").addClass("fi-minus");
      $("#c-list ul.tagit").removeClass("tagit-big");
    }

  });

$("#add-concepts").click(
  function()
  {
    if(genesTxtIsOpened === true && conceptsTxtIsOpened === true)
    {
      // CLOSE CONCEPTS TXT AREA
      $("#c-list:visible").hide('blind', { easing: "swing" }, 500, function() { genesTxtIsOpened = false });
      $("#add-concepts > i").addClass("fi-plus");
      $("#add-concepts > i").removeClass("fi-minus");
      $("#g-list ul.tagit").addClass("tagit-big");
      $("#concepts-input").tagit("removeAll");
      QgenesRequest.concepts = [];
    }

    if(genesTxtIsOpened === false)
    {
      // OPEN CONCEPTS TXT AREA
      $("#c-list:hidden").show('blind', { easing: "swing" }, 500, function() { genesTxtIsOpened = true });
      $("#add-concepts > i").removeClass("fi-plus");
      $("#add-concepts > i").addClass("fi-minus");
      $("#g-list ul.tagit").removeClass("tagit-big");
    }

  });





$(document).ready(
function()
{
  if($("#g-list").is(":visible"))
  {
    $("#add-genes > i").removeClass("fi-plus");
    $("#add-genes > i").addClass("fi-minus");
  }
  else
  {
    $("#add-genes > i").removeClass("fi-minus");
    $("#add-genes > i").addClass("fi-plus");
  }

  if($("#c-list").is(":visible"))
  {
    $("#add-concepts > i").removeClass("fi-plus");
    $("#add-concepts > i").addClass("fi-minus");
  }
  else
  {
    $("#add-concepts > i").removeClass("fi-minus");
    $("#add-concepts > i").addClass("fi-plus");
  }
});
