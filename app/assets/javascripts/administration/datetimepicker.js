(function ($) {

  $(document).on('initDatetimepicker', function() {
    $('[data-behavior=datetimepicker]').each(function(){
      var input = $(this).find('input');
      $(this).datetimepicker({
        format: input.data('format') || "D MMM YYYY / hh: mm Z",
        sideBySide: input.data('sidebyside') || true,
        minDate: input.data('min-date'),
        useCurrent: input.data('use-current') || false,
        allowInputToggle: true,
        keepInvalid: input.data('keep-invalid') || true,
        timeZone: input.data('time-zone') || 'Etc/GMT-4'
      });
    });
  });

  $(document).ready(function () {
    $(document).trigger('initDatetimepicker');
  });
}(jQuery));
