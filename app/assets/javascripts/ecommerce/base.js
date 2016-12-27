$(function () {
  $('#currencies a.currency').on('click', function (event) {
    event.preventDefault();
    Cookies.set('currency', $(this).data('value'));
    window.location.reload();
  });
});
