Utils = {
  copyToClipboard: function(text) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(text).select();
    document.execCommand("copy");
    $temp.remove();
  },
  isElementInViewport: function(el) {
    var rect = el.getBoundingClientRect();

    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (innerWidth || document.documentElement.clientWidth)
    );
  }
};
