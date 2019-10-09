$(function () {
  $(document).on('change', '#privacy_link_checkbox', function () {
    $('#privacy_link_details').toggleClass('hidden')
  })
});
