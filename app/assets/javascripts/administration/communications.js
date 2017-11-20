$(function () {
  $(document).on('change', '[data-behavior~=communication-changeable]', function () {
    var self = this;
    var dataBehavior = $(self).data('behavior');
    if (isCollectionContain(dataBehavior, 'client_id')) {
      $('[data-behavior~=client-resettable]').val(null)
    } else if (isCollectionContain(dataBehavior, 'project_id')) {
      $('[data-behavior~=project-resettable]').val(null)
    } else if (isCollectionContain(dataBehavior, 'campaign_id') &&
      !isCollectionContain(dataBehavior, 'sub_campaign_id')) {
      $('[data-behavior~=campaign-resettable]').val(null)
    } else if (isCollectionContain(dataBehavior, 'sub_campaign_id')) {
      $('[data-behavior~=sub_campaign-resettable]').val(null)
    }

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

  function isCollectionContain(collection, element) {
    return collection.indexOf(element) !== -1
  }
});
