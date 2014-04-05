(function($, undefined) {
  $.fn.simulate = function(type, options) {
    switch(type) {
      case "drag":
      ;
      case "drop":
      ;
      case "drag-n-drop":
        var ele = this.first();
        new $.simulate(ele[0], type, options);
        return ele;
      default:
        return this.each(function() {
          new $.simulate(this, type, options);
        });
    }
  };
  var now = Date.now || function() {
    return(new Date).getTime();
  };
  var rdocument = /\[object (?:HTML)?Document\]/;
  function isDocument(elem) {
    return rdocument.test(Object.prototype.toString.call($(elem)[0]));
  }
  function selectFirstMatch(array, check) {
    var i;
    if ($.isFunction(check)) {
      for (i = 0;i < array.length;i += 1) {
        if (check(array[i])) {
          return array[i];
        }
      }
      return null;
    } else {
      for (i = 0;i < array.length;i += 1) {
        if (array[i]) {
          return array[i];
        }
      }
      return null;
    }
  }
  function findCenter(elem) {
    var offset;
    elem = $(elem);
    if (isDocument(elem[0])) {
      offset = {left:0, top:0};
    } else {
      offset = elem.offset();
    }
    return{x:offset.left + elem.outerWidth() / 2, y:offset.top + elem.outerHeight() / 2};
  }
  function pageToClientPos(x, y, docRel) {
    var jDocument;
    if (isDocument(y)) {
      jDocument = $(y);
    } else {
      jDocument = $(docRel || document);
    }
    if (typeof x === "number" && typeof y === "number") {
      return{x:x - jDocument.scrollLeft(), y:y - jDocument.scrollTop()};
    } else {
      if (typeof x === "object" && (x.pageX && x.pageY)) {
        return{clientX:x.pageX - jDocument.scrollLeft(), clientY:x.pageY - jDocument.scrollTop()};
      }
    }
  }
  function elementAtPosition(x, y, docRel) {
    var doc;
    if (isDocument(y)) {
      doc = y;
    } else {
      doc = docRel || document;
    }
    if (!doc.elementFromPoint) {
      return null;
    }
    var clientX = x, clientY = y;
    if (typeof x === "object" && (x.clientX || x.clientY)) {
      clientX = x.clientX || 0;
      clientY = x.clientY || 0;
    }
    if (elementAtPosition.prototype.check) {
      var sl, ele;
      if ((sl = $(doc).scrollTop()) > 0) {
        ele = doc.elementFromPoint(0, sl + $(window).height() - 1);
        if (ele !== null && ele.tagName.toUpperCase() === "HTML") {
          ele = null;
        }
        elementAtPosition.prototype.nativeUsesRelative = ele === null;
      } else {
        if ((sl = $(doc).scrollLeft()) > 0) {
          ele = doc.elementFromPoint(sl + $(window).width() - 1, 0);
          if (ele !== null && ele.tagName.toUpperCase() === "HTML") {
            ele = null;
          }
          elementAtPosition.prototype.nativeUsesRelative = ele === null;
        }
      }
      elementAtPosition.prototype.check = sl <= 0;
    }
    if (!elementAtPosition.prototype.nativeUsesRelative) {
      clientX += $(doc).scrollLeft();
      clientY += $(doc).scrollTop();
    }
    return doc.elementFromPoint(clientX, clientY);
  }
  elementAtPosition.prototype.check = true;
  elementAtPosition.prototype.nativeUsesRelative = true;
  function dragFinished(ele, options) {
    var opts = options || {};
    $(ele).trigger({type:"simulate-drag"});
    if ($.isFunction(opts.callback)) {
      opts.callback.apply(ele);
    }
  }
  function interpolatedEvents(self, ele, start, drag, options) {
    var targetDoc = selectFirstMatch([ele, ele.ownerDocument], isDocument) || document, interpolOptions = options.interpolation, dragDistance = Math.sqrt(Math.pow(drag.dx, 2) + Math.pow(drag.dy, 2)), stepWidth, stepCount, stepVector;
    if (interpolOptions.stepWidth) {
      stepWidth = parseInt(interpolOptions.stepWidth, 10);
      stepCount = Math.floor(dragDistance / stepWidth) - 1;
      var stepScale = stepWidth / dragDistance;
      stepVector = {x:drag.dx * stepScale, y:drag.dy * stepScale};
    } else {
      stepCount = parseInt(interpolOptions.stepCount, 10);
      stepWidth = dragDistance / (stepCount + 1);
      stepVector = {x:drag.dx / (stepCount + 1), y:drag.dy / (stepCount + 1)};
    }
    var coords = $.extend({}, start);
    function interpolationStep() {
      coords.x += stepVector.x;
      coords.y += stepVector.y;
      var effectiveCoords = {pageX:coords.x, pageY:coords.y};
      if (interpolOptions.shaky && (interpolOptions.shaky === true || !isNaN(parseInt(interpolOptions.shaky, 10)))) {
        var amplitude = interpolOptions.shaky === true ? 1 : parseInt(interpolOptions.shaky, 10);
        effectiveCoords.pageX += Math.floor(Math.random() * (2 * amplitude + 1) - amplitude);
        effectiveCoords.pageY += Math.floor(Math.random() * (2 * amplitude + 1) - amplitude);
      }
      var clientCoord = pageToClientPos(effectiveCoords, targetDoc), eventTarget = elementAtPosition(clientCoord, targetDoc) || ele;
      self.simulateEvent(eventTarget, "mousemove", {pageX:Math.round(effectiveCoords.pageX), pageY:Math.round(effectiveCoords.pageY)});
    }
    var lastTime;
    function stepAndSleep() {
      var timeElapsed = now() - lastTime;
      if (timeElapsed >= stepDelay) {
        if (step < stepCount) {
          interpolationStep();
          step += 1;
          lastTime = now();
          setTimeout(stepAndSleep, stepDelay);
        } else {
          var pageCoord = {pageX:Math.round(start.x + drag.dx), pageY:Math.round(start.y + drag.dy)}, clientCoord = pageToClientPos(pageCoord, targetDoc), eventTarget = elementAtPosition(clientCoord, targetDoc) || ele;
          self.simulateEvent(eventTarget, "mousemove", pageCoord);
          dragFinished(ele, options);
        }
      } else {
        setTimeout(stepAndSleep, stepDelay - timeElapsed);
      }
    }
    if (!interpolOptions.stepDelay && !interpolOptions.duration || interpolOptions.stepDelay <= 0 && interpolOptions.duration <= 0) {
      for (var i = 0;i < stepCount;i += 1) {
        interpolationStep();
      }
      var pageCoord = {pageX:Math.round(start.x + drag.dx), pageY:Math.round(start.y + drag.dy)}, clientCoord = pageToClientPos(pageCoord, targetDoc), eventTarget = elementAtPosition(clientCoord, targetDoc) || ele;
      self.simulateEvent(eventTarget, "mousemove", pageCoord);
      dragFinished(ele, options);
    } else {
      var stepDelay = parseInt(interpolOptions.stepDelay, 10) || Math.ceil(parseInt(interpolOptions.duration, 10) / (stepCount + 1));
      var step = 0;
      lastTime = now();
      setTimeout(stepAndSleep, stepDelay);
    }
  }
  $.simulate.activeDrag = function() {
    if (!$.simulate._activeDrag) {
      return undefined;
    }
    return $.extend(true, {}, $.simulate._activeDrag);
  };
  $.extend($.simulate.prototype, {simulateDrag:function() {
    var self = this, ele = self.target, options = $.extend({dx:0, dy:0, dragTarget:undefined, clickToDrag:false, interpolation:{stepWidth:0, stepCount:0, stepDelay:0, duration:0, shaky:false}, callback:undefined}, this.options);
    var start, continueDrag = $.simulate._activeDrag && $.simulate._activeDrag.dragElement === ele;
    if (continueDrag) {
      start = $.simulate._activeDrag.dragStart;
    } else {
      start = findCenter(ele);
    }
    var x = Math.round(start.x), y = Math.round(start.y), coord = {pageX:x, pageY:y}, dx, dy;
    if (options.dragTarget) {
      var end = findCenter(options.dragTarget);
      dx = Math.round(end.x - start.x);
      dy = Math.round(end.y - start.y);
    } else {
      dx = options.dx || 0;
      dy = options.dy || 0;
    }
    if (continueDrag) {
      $.simulate._activeDrag.dragDistance.x += dx;
      $.simulate._activeDrag.dragDistance.y += dy;
      coord = {pageX:Math.round(x + $.simulate._activeDrag.dragDistance.x), pageY:Math.round(y + $.simulate._activeDrag.dragDistance.y)};
    } else {
      if ($.simulate._activeDrag) {
        $($.simulate._activeDrag.dragElement).simulate("drop");
      }
      self.simulateEvent(ele, "mousedown", coord);
      if (options.clickToDrag === true) {
        self.simulateEvent(ele, "mouseup", coord);
        self.simulateEvent(ele, "click", coord);
      }
      $(ele).add(ele.ownerDocument).one("mouseup", function() {
        $.simulate._activeDrag = undefined;
      });
      $.extend($.simulate, {_activeDrag:{dragElement:ele, dragStart:{x:x, y:y}, dragDistance:{x:dx, y:dy}}});
      coord = {pageX:Math.round(x + dx), pageY:Math.round(y + dy)};
    }
    if (dx !== 0 || dy !== 0) {
      if (options.interpolation && (options.interpolation.stepCount || options.interpolation.stepWidth)) {
        interpolatedEvents(self, ele, {x:x, y:y}, {dx:dx, dy:dy}, options);
      } else {
        var targetDoc = selectFirstMatch([ele, ele.ownerDocument], isDocument) || document, clientCoord = pageToClientPos(coord, targetDoc), eventTarget = elementAtPosition(clientCoord, targetDoc) || ele;
        self.simulateEvent(eventTarget, "mousemove", coord);
        dragFinished(ele, options);
      }
    } else {
      dragFinished(ele, options);
    }
  }, simulateDrop:function() {
    var self = this, ele = this.target, activeDrag = $.simulate._activeDrag, options = $.extend({clickToDrop:false, callback:undefined}, self.options), moveBeforeDrop = true, center = findCenter(ele), x = Math.round(center.x), y = Math.round(center.y), coord = {pageX:x, pageY:y}, targetDoc = (activeDrag ? selectFirstMatch([activeDrag.dragElement, activeDrag.dragElement.ownerDocument], isDocument) : selectFirstMatch([ele, ele.ownerDocument], isDocument)) || document, clientCoord = pageToClientPos(coord, 
    targetDoc), eventTarget = elementAtPosition(clientCoord, targetDoc);
    if (activeDrag && (activeDrag.dragElement === ele || isDocument(ele))) {
      x = Math.round(activeDrag.dragStart.x + activeDrag.dragDistance.x);
      y = Math.round(activeDrag.dragStart.y + activeDrag.dragDistance.y);
      coord = {pageX:x, pageY:y};
      clientCoord = pageToClientPos(coord, targetDoc);
      eventTarget = elementAtPosition(clientCoord, targetDoc);
      moveBeforeDrop = false;
    }
    if (!eventTarget) {
      eventTarget = activeDrag ? activeDrag.dragElement : ele;
    }
    if (moveBeforeDrop === true) {
      self.simulateEvent(eventTarget, "mousemove", coord);
    }
    if (options.clickToDrop) {
      self.simulateEvent(eventTarget, "mousedown", coord);
    }
    this.simulateEvent(eventTarget, "mouseup", coord);
    if (options.clickToDrop) {
      self.simulateEvent(eventTarget, "click", coord);
    }
    $.simulate._activeDrag = undefined;
    $(eventTarget).trigger({type:"simulate-drop"});
    if ($.isFunction(options.callback)) {
      options.callback.apply(eventTarget);
    }
  }, simulateDragNDrop:function() {
    var self = this, ele = this.target, options = $.extend({dragTarget:undefined, dropTarget:undefined}, self.options), dropEle = (options.dragTarget || (options.dx || options.dy) ? options.dropTarget : ele) || ele;
    $(ele).simulate("drag", $.extend({}, options, {dragTarget:options.dragTarget || (options.dx || options.dy ? undefined : options.dropTarget), callback:function() {
      $(dropEle).simulate("drop", options);
    }}));
  }});
})(jQuery);