(function($) {
  var originalMouseEvent = $.simulate.prototype.mouseEvent, rdocument = /\[object (?:HTML)?Document\]/;
  $.simulate.prototype.mouseEvent = function(type, options) {
    if (options.pageX || options.pageY) {
      var doc = rdocument.test(Object.prototype.toString.call(this.target)) ? this.target : this.target.ownerDocument || document;
      options.clientX = (options.pageX || 0) - $(doc).scrollLeft();
      options.clientY = (options.pageY || 0) - $(doc).scrollTop();
    }
    return originalMouseEvent.apply(this, [type, options]);
  };
})(jQuery);