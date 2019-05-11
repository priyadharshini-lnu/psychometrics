"use strict";

$(document).ready(function () {

  //Override the default confirm dialog by rails
  $.rails.allowAction = function (link) {
    if (!link.attr('data-confirm')) {
      return true;
    }
    $.rails.showConfirmDialog(link);
    return false;
  }

  $.rails.confirmed = function(link) {
    link.removeAttr('data-confirm');
    return link.trigger('click.rails');
  };

  //Display the confirmation dialog
  $.rails.showConfirmDialog = function (link) {
    var data = link.data("confirm"),
        template = $('#mb-confirm-template').html();
    if (template) {
      var rendered = $(Mustache.render(template, data));
      $('#confirm-container').html(rendered.toggleClass('open'));
      rendered.find('.mb-confirm-yes').on('click', function(){
        $.rails.confirmed(link);
      });
    } else {
      if (window.confirm(link.data("confirm"))) {
        $.rails.confirmed(link);
      }
    }
  }
});
