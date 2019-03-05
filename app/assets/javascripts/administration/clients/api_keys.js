$(function () {
  $(document).on('click', '.show-token', function () {
    var $td = $(this).closest('td');
    var $token = $td.find('.token > span');
    $td.find('.token').removeClass('encrypted').find('> span').removeClass('hidden');
    $td.find('.hide-token').removeClass('hidden');
    $(this).addClass('hidden');

    copyToClipboard($token);
    noty({ text: 'Token is copied to clipboard successfully', type: 'success' });
  });
  $(document).on('click', '.hide-token', function () {
    var $td = $(this).closest('td');
    var $token = $td.find('.token > span');
    $td.find('.token').addClass('encrypted').find('> span').addClass('hidden');
    $td.find('.show-token').removeClass('hidden')
    $(this).addClass('hidden')
  });

  $(document).on('click', '.copy-key', function () {
    var $key = $(this).closest('td').find('.key');
    copyToClipboard($key);
    noty({ text: 'Key is copied to clipboard successfully', type: 'success' });
  })

  function copyToClipboard(element) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(element).text()).select();
    document.execCommand("copy");
    $temp.remove();
  }
});
