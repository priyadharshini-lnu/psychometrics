$(function () {
  $(document).on(
    'change',
    "#filter[action*='/administration/communications'] select[name='q[client_id_in][]'], " +
    "#filter[action*='/administration/communications'] select[name='q[project_id_eq]'], " +
    "#filter[action*='/administration/communications'] select[name='q[campaign_id_eq]']",
    function () {
      $('#communications_refresh_filters').val('1')
    }
  )

  $(document).on(
    'input change',
    "#filter[action*='/administration/communications'] input[name='q[subject_or_body_cont]'], " +
    "#filter[action*='/administration/communications'] select[name='q[kind_in][]']",
    function () {
      $('#communications_refresh_filters').val('0')
    }
  )

  $(document).on('change', '[data-behavior~=communication-changeable]', function () {
    updateForm(this);
  });

  function isCollectionContain(collection, element) {
    return collection.indexOf(element) !== -1
  }

  function updateForm(self) {
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
  }
});
