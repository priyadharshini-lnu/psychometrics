$(function () {
  $('#edit_user #change_password').on('change', function() {
    var checked = $(this).prop('checked')
    $('#password_block').toggleClass('hidden')
    $('#password_block input').attr('disabled', !checked) 
  })
})