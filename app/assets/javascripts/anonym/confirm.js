// Display the confirmation dialog
$.rails.showConfirmDialog = function (data) {
  var template = $('#mb-confirm-template').html();

  var rendered = $(Mustache.render(template, data));
  $('#confirm-container').html(rendered.toggleClass('open'));
  rendered.find('.mb-confirm-yes').on('click', function () {
    let { hostname } = location

    Cookies.remove('tte-anonym-payload', { domain: `.${hostname}`, path: '/' })
    location.reload(true)
  })
}

$(document).ready(function () {
  let { hostname } = location
  let c = Cookies.getJSON('tte-anonym-payload')

  if (c && c.assign.step > 0) {
    $.rails.showConfirmDialog({
      title: I18n.t('anonym.notifications.restart.title'),
      body: I18n.t('anonym.notifications.restart.copy')
    })
  }
})
