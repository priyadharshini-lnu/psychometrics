$(function () {
  $(document).on('click', '.show-token', function () {
    var $td = $(this).closest('td')
    $td.find('.hiding-token').addClass('hidden');
    $td.find('.showing-token').removeClass('hidden');
    $td.find('.showing-token').find('input').focus().select();
  });
  $(document).on('click', '.hide-token', function () {
    var $td = $('.hide-token').closest('td')
    $td.find('.hiding-token').removeClass('hidden');
    $td.find('.showing-token').addClass('hidden');
  });
});
