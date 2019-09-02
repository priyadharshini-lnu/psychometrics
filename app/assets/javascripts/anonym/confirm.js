// Display the confirmation dialog
$.rails.showConfirmDialog = function (data) {
  var template = $('#mb-confirm-template').html();

  var rendered = $(Mustache.render(template, data));
  $('#confirm-container').html(rendered.toggleClass('open'));
  rendered.find('.mb-confirm-yes').on('click', function () {
    let { pathname, hostname } = location

    Cookies.remove('tte-anonym-payload', { path: pathname, domain: `.${hostname}`})
    location.reload(true)
  })
}

$(document).ready(function () {
  let c = Cookies.getJSON('tte-anonym-payload')

  if (c && c.assign.step > 1) {
    $.rails.showConfirmDialog({
      title: I18n.t('anonym.notifications.restart.title'),
      body: I18n.t('anonym.notifications.restart.copy')
    })
  }
})
