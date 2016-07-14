$(function(){
  $(document).on('ajax:error', '[data-remote="true"]', function(e){
    noty({text: 'Something went wrong. Contact your administrator', layout: 'topCenter', type: 'error'});
  });
})
