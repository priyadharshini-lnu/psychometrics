$(function () {
  $(document).on('change', '#resource_assessment_id, #resource_client_id, #resource_recipients, #resource_delivery_rule', function () {
    var self = this;
    // Sync WYSIWYG with form
    //$('#resource_body').val($('#resource_body').summernote('code'));
    var form = $('[data-behavior=communications-form]');
    if (form.length > 0) {
      $.ajax({
        url: form.data('form-url'),
        method: 'POST',
        data: $('#new_resource, #edit_resource').serialize(),
        dataType: 'script',
        beforeSend: function () {
          panel_refresh($(self).closest('.modal-body'));
        }
      });
    }
  });
});
