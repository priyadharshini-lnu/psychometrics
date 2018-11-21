$(function() {
  // Show error message, when server retuen 500 erorr
  $(document).ajaxError(function(_, data){
    if (data.status == 500) {
       noty({text: I18n.t('administration.noty.error_500'), layout: 'topCenter', type: 'error'});
    }
  });

  $(document).on('click', '[data-loading-text]', function () {
    $(this).button('loading');
  })

  $(document).on('ajax:beforeSend', function (e) {
    var panel = $(e.target).parents('.panel');
    panel_refresh(panel);
  });

    $(document).ajaxSuccess(function(e) {
        var panel = $('.panel.panel-default.panel-refreshing')
        panel_refresh(panel);
    })

  $('.x-navigation .xn-openable .active').each(function() {
    $(this).parents('.xn-openable').addClass('active');
  });

  $(document).on('initPlugins', function() {
    window.uiElements.init();
    window.formElements.init();
  });

  $(document).on('cocoon:after-insert', function (e, insertedItem) {
    window.formElements.init();
  });

  // Disabled button after submit
  // $(document).on('click', '[type="submit"]', function () {
  //   $(this).button('loading');
  // })

  // Noty plugin settings
  $.noty.defaults.timeout = 4000;
  $.noty.defaults.layout = 'topCenter';
  $.noty.defaults.animation.open   = { opacity: 'toggle' };
  $.noty.defaults.animation.speed  = 100;
  $.noty.defaults.animation.easing = 'linear';

  // Reload filter form
  $(document).on('reloadList', '#filter', window.Filterrific.submitFilterForm);

  // radio-switch
  $(function () {
    $(document).on('change', '.radio-switch input', function (e) {
      var id = $(this).attr('data-target');
      $(id).addClass('active').siblings('.tab').removeClass('active')
    })
  });
});

// Replace with return new DOM
$.fn.replaceWithPush = function(a) {
  var $a = $(a);

  this.replaceWith($a);
  return $a;
};
