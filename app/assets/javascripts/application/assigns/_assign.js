// TODO (atanych): Im sorry for a bad code. But I dont know any idea, except to move all frontend on React/Redux side
$(function () {

  var storage = {}

  $(document).on('click', '#user #assigns_index .assign a', function (e) {
    var $el = $(this)
    if($el.data('privacy-consent')) {
      e.preventDefault()
      processPrivacyConsent($(this))  
    }
  })

  function processPrivacyConsent($el) {
    var isMindMill = $el.hasClass('mindmill_link'),
      href = $el.data('privacy-consent').href,
      needConfirm = !!$el.data('privacy-consent').need_confirm
    if (!needConfirm) { return isMindMill ? processMindMill($el.data('mindmill')) : location.href = href }
    storage = {
      isMindMill: isMindMill,
      mindmillData: $el.data('mindmill'),
      href: href
    }
    $('.modal-accept-privacy').modal('show')

  }

  function processMindMill(data) {
    var textConfirm = data.confirm_text,
      href = data.href,
      needConfirm = !!data.need_confirm,
      confirmed = needConfirm && confirm(textConfirm)
    if(needConfirm === false || confirmed === true) {
      window.open(href, 'windowMindmill', 'width=980,height=700,resizable,scrollbars')
    }
  }

  // Modal handler
  $('.modal-accept-privacy .btn-success').on('click', function() {
    $.ajax({
      url: "/assigns/accept_privacy",
      method: 'POST',
      success: function() {
        location.reload()
      }
    })
  })
})
