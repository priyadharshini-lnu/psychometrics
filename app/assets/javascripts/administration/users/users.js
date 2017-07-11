$(function () {
  $(document).on('change', '.grants-table input[type=checkbox]', function (e) {
    var $this = $(this),
        val = $this.val(),
        checked = $this.prop('checked');

    if (val === 'manage' && checked) {
      trigger_input('view', checked)
    }
    if (val === 'view' && !checked) {
      trigger_input('manage', false)
    }

    function trigger_input (value, checked) {
      $this.parent('label').siblings('label').children('input[type=checkbox][value=' + value + ']').prop('checked', checked)
    }
  })
});
