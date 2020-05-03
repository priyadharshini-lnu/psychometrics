/* eslint-disable no-undef */
/* eslint-disable no-alert */
/* eslint-disable no-var */
/* eslint-disable prefer-arrow-callback */

$(document).ready(function () {
  // Override the default confirm dialog by rails
  $.rails.allowAction = function (link) {
    if (!link.attr('data-confirm')) {
      return true
    }
    $.rails.showConfirmDialog(link)
    return false
  }

  $.rails.confirmed = function (link) {
    link.removeAttr('data-confirm')
    return link.trigger('click.rails')
  }

  // Display the confirmation dialog
  $.rails.showConfirmDialog = function (link) {
    var data = link.data('confirm')
    var templateString = link.data('target')
    var template = $(templateString || '#mb-confirm-template').html()
    var container = $('#confirm-container')
    var rendered

    if (template) {
      rendered = $(Mustache.render(template, data))
      container.html(rendered.toggleClass('open'))
      rendered.find('.mb-confirm-yes').on('click', function () {
        $.rails.confirmed(link)
      })
      if (templateString) {
        container.data('validation-pattern', link.data('pattern'))
      }
    } else if (window.confirm(link.data('confirm'))) {
      $.rails.confirmed(link)
    }
  }
})
