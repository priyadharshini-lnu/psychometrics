$(function () {
    $(document).on('click', '.copy-coded-url', function () {
      var url = $(this).attr("data-title");
      copyToClipboard(url);
      noty({ text: 'URL is copied to clipboard successfully', type: 'success' });
    })
    function copyToClipboard(url) {
      var $temp = $("<input>");
      $("body").append($temp);
      $temp.val(url).select();
      document.execCommand("copy");
      $temp.remove();
    }
  });
