$(function () {
  $(document).on('change', '.grants-table input[type=checkbox]', function (e) {
    var $this = $(this),
        checked = $this.prop('checked');

    if (checked && $this.data('turnOn')) {
      $.each($this.data('turnOn'), function (i, id) {
        set_input(id, true)
      });
      return false;
    }

    if (!checked && $this.data('turnOff')) {
      $.each($this.data('turnOff'), function (i, id) {
        set_input(id, false)
      });
      return false;
    }

    function set_input (id, value) {
      return $('#' + id).prop('checked', value).trigger('change')
    }
  })
});
