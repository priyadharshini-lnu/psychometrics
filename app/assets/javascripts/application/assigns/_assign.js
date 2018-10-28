$(function () {
  $(document).on('click', '#user #assigns_index .assign a', function (e) {
    e.preventDefault()
    processPrivacyConsent($(this))
  })

  function processPrivacyConsent($el) {
    var textConfirm = $el.data('privacy-consent').confirm_text,
      isMindMill = $el.hasClass('mindmill_link'),
      href = $el.data('privacy-consent').href,
      needConfirm = !!$el.data('privacy-consent').need_confirm
    if (!needConfirm) { return isMindMill ? processMindMill($el) : location.href = href }
    const confirmed = confirm(textConfirm)
    if (!confirmed) { return null }
    $.ajax({
      url: "/assigns/accept_privacy",
      method: 'POST',
      success: function() {
        if (isMindMill) {
          processMindMill($el)
        } else {
          location.href = href
        }
      }
    })
  }

  function processMindMill($el) {
    var textConfirm = $el.data('mindmill').confirm_text,
      href = $el.data('mindmill').href,
      needConfirm = !!$el.data('mindmill').need_confirm,
      confirmed = needConfirm && confirm(textConfirm)
    if(needConfirm === false || confirmed === true) {
      window.open(href, 'windowMindmill', 'width=980,height=700,resizable,scrollbars')
    }
  }
})
