$(function () {
  $(document).on('change', '#privacy_link_checkbox', () => {
    $('#privacy_link_details').toggleClass('hidden')
  })
});
