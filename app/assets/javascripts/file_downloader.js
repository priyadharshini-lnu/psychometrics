//= require jquery.fileDownload
//= require ladda/spin.min
//= require ladda/ladda.min

$(function () {
  $(document).on('ready page:load', function () {
    Ladda.bind('.ladda-button');
  });

  $(document).on('click', '[data-behavior=export-pdf]', function (e) {
    $.fileDownload($(this).attr('href'), {
      successCallback: function(url) {
        Ladda.stopAll();
      },
    });
    return false;
  });
});
