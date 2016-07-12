$(function(){
  $('.btn-group label.btn input:checked').each(function(){
    $(this).closest('label').addClass('active');
  })
})
