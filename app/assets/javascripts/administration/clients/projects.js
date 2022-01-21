$(function () {
  $(document).on('change', '#privacy_link_checkbox', function () {
    $('#privacy_link_details').toggleClass('hidden')
  })
  $(document).on('change', '#resource_enable_live_chat', function () {
    $('#live_chat_token').toggleClass('hidden')
  })
  $(document).on('change', '#resource_webhook_auth_enabled', function () {
    $('#webhook_credentials').toggleClass('hidden')
  })
});
