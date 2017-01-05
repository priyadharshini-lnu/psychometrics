$(function () {
  $('#currencies a.currency').on('click', function (event) {
    event.preventDefault();
    Cookies.set('currency', $(this).data('value'));
    window.location.reload();
  });
  
  $.noty.defaults.timeout = 4000;
  $.noty.defaults.layout = 'topCenter';
  $.noty.defaults.animation.open   = { opacity: 'toggle' };
  $.noty.defaults.animation.speed  = 100;
  $.noty.defaults.animation.easing = 'linear';
});
