$(function () {
  $(document).on('click', '#user #assigns_index .assign a.mindmill_link', function (e) {
    e.preventDefault();
    var textConfirm = $(this).data('confirm-text'),
        href = $(this).data('href'),
        need_confirm = $(this).data('need-confirm'),
        confirmed = need_confirm && confirm(textConfirm);
    if(need_confirm === false || confirmed === true) {
      window.open(href, 'windowMindmill', 'width=980,height=700');
    }
  })
})
