//= require jquery.fileDownload
//= require ladda/spin.min
//= require ladda/ladda.min

$(function () {
  $(document).on('ready page:load', function () {
    Ladda.bind('.ladda-button');
  });

  $(document).on('click', '[data-behavior=export-pdf]', function (e) {
    if ($(this).find('.ladda-button')[0].hasAttribute('data-loading')) return false;
    $.fileDownload($(this).attr('href'), {
      successCallback: function(url) {
        Ladda.stopAll();
      },
      failCallback: function (html, url) {
        noty({text: I18n.t('administration.noty.error_408'), layout: 'topCenter', type: 'error'});
        Ladda.stopAll();
      }
    });
    return false;
  });
});
