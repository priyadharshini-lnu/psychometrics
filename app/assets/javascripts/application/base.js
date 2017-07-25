var PSY = PSY || {};

(function (o) {
  o.isMobileDevice = function () {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
  };
  return o;
})(PSY);

$(function () {
  if (PSY.isMobileDevice()) {
    $('body').addClass('mobile-device')
  }
});
