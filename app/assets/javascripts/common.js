$(function () {
  $("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("active");
  });
  $(document).on("click", ".assign [data-loading]", function () {
    var $assignPanel = $(this).closest(".assign");
    $assignPanel.addClass("loading");
    $assignPanel.append('<div class="loading"/>')
  });
})
