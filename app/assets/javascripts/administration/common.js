$(function() {
  // Show error message, when server retuen 500 erorr
  $(document).ajaxError(function(_, data){
     if (data.status == 500) {
        noty({text: I18n.t('administration.noty.error_500'), layout: 'topCenter', type: 'error'});
     }
  });

  $('.x-navigation .xn-openable .active').each(function() {
    $(this).parents('.xn-openable').addClass('active');
  });

  $(document).on('initPlugins', function() {
    window.uiElements.init();
    window.formElements.init();
  });

  // Disabled button after submit
  // $(document).on('click', '[type="submit"]', function () {
  //   $(this).button('loading')
  // })

  // Noty plugin settings
  $.noty.defaults.timeout = 4000;
  $.noty.defaults.layout = 'topCenter';
  $.noty.defaults.animation.open   = { opacity: 'toggle' };
  $.noty.defaults.animation.speed  = 100;
  $.noty.defaults.animation.easing = 'linear';

  // Reload filter form
  $(document).on('reloadList', '#filter', window.Filterrific.submitFilterForm);

});

// Replace with return new DOM
$.fn.replaceWithPush = function(a) {
  var $a = $(a);

  this.replaceWith($a);
  return $a;
};
