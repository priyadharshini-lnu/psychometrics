$(function () {
  $(document).on('click', '[data-behavior~=submit-hogan-link]', function () {
    var assignId = $(this).data('assignId');
    $.ajax({
      url: Routes.pass_hogan_assign_path(assignId),
      method: 'PUT',
      dataType: 'JSON',
      success: function() {
        $('#hogan-form-' + assignId).submit();
      }
    });
  });
});
