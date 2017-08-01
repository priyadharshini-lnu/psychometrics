$(function () {
  $(document).on('change', '.grants-table input[type=checkbox]', function (e) {
    var $this = $(this),
        checked = $this.prop('checked');

    if (checked) {
      if ($this.data('turnOn')) {
        toggle_inputs($this.data('turnOn'), true)
      }

      if ($this.data('turnOnIf')) {
        toggle_inputs_if($this.data('turnOnIf'), true)
      }
      return;
    }

    if ($this.data('turnOff')) {
      toggle_inputs($this.data('turnOff'), false)
    }

    if ($this.data('turnOffIf')) {
      toggle_inputs_if($this.data('turnOffIf'), false)
    }

    function toggle_inputs_if (arr, val) {
      $.each(arr, function (i, data) {
        var disabled = false,
            enabled = true;

        $.each(data.disabled, function (i, id) {
          disabled = disabled || $('#' + id).prop('checked')
        });

        $.each(data.enabled, function (i, id) {
          enabled = enabled && $('#' + id).prop('checked')
        });

        if (!disabled && enabled) {
          toggle_inputs(data.ids, val)
        }
      });
    }

    function toggle_inputs (data, val) {
      $.each(data, function (i, id) {
        set_input(id, val)
      });
      return false;
    }

    function set_input (id, value) {
      return $('#' + id).prop('checked', value).trigger('change')
    }
  })
});
