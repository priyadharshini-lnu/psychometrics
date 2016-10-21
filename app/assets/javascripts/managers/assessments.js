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

})