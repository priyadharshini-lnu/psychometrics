$(function () {
  $('[data-toggle="tooltip"]').tooltip()
  $('.collapse').on('shown.bs.collapse', function () {
    $(this).parent().find(".glyphicon-chevron-down").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-up");
  }).on('hidden.bs.collapse', function () {
    $(this).parent().find(".glyphicon-chevron-up").removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
  });
  var windowWidth = $(window).width();
  if (windowWidth <= 768) //for iPad & smaller devices
    $('.panel-collapse').addClass('in')

  $(".reportOne").click(function () {
    $(".completionReport").show(1000);
    $(".surveyReport").hide(1000);
    $(".organisationalSurvey").hide(1000);
    $(".psychometricReport").hide(1000);
  });
  $(".reportTwo").click(function () {
    $(".surveyReport").show(1000);
    $(".completionReport").hide(1000);
    $(".organisationalSurvey").hide(1000);
    $(".psychometricReport").hide(1000);
  });
  $(".reportThree").click(function () {
    $(".organisationalSurvey").show(1000);
    $(".surveyReport").hide(1000);
    $(".completionReport").hide(1000);
    $(".psychometricReport").hide(1000);
  });
  $(".reportFour").click(function () {
    $(".psychometricReport").show(1000);
    $(".completionReport").hide(1000);
    $(".organisationalSurvey").hide(1000);
    $(".surveyReport").hide(1000);
  });
})