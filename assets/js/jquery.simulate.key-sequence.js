(function($, undefined) {
  var quirks = {delayedSpacesInNonInputGlitchToEnd:false};
  $.extend($.simulate.prototype, {simulateKeySequence:function() {
    var target = this.target, $target = $(target), opts = $.extend({sequence:"", triggerKeyEvents:true, delay:0, callback:undefined}, this.options), sequence = opts.sequence;
    opts.delay = parseInt(opts.delay, 10);
    var localkeys = {};
    if (quirks.delayedSpacesInNonInputGlitchToEnd && !$target.is("input,textarea")) {
      $.extend(localkeys, {" ":function(rng, s, opts) {
        var internalOpts = $.extend({}, opts, {triggerKeyEvents:false, delay:0, callback:undefined});
        $.simulate.prototype.simulateKeySequence.defaults.simplechar(rng, "\u00a0", internalOpts);
        $.simulate.prototype.simulateKeySequence.defaults["{leftarrow}"](rng, s, internalOpts);
        $.simulate.prototype.simulateKeySequence.defaults.simplechar(rng, s, opts);
        $.simulate.prototype.simulateKeySequence.defaults["{del}"](rng, s, internalOpts);
      }});
    }
    $.extend(localkeys, opts, $target.data("simulate-keySequence"));
    var rng = $.data(target, "simulate-keySequence.selection");
    if (!rng) {
      rng = bililiteRange(target).bounds("selection");
      $.data(target, "simulate-keySequence.selection", rng);
      $target.bind("mouseup.simulate-keySequence", function() {
        $.data(target, "simulate-keySequence.selection").bounds("selection");
      }).bind("keyup.simulate-keySequence", function(evt) {
        if (evt.which === 9) {
          $.data(target, "simulate-keySequence.selection").select();
        } else {
          $.data(target, "simulate-keySequence.selection").bounds("selection");
        }
      });
    }
    target.focus();
    if (typeof sequence === "undefined") {
      return;
    }
    sequence = sequence.replace(/\n/g, "{enter}");
    function sequenceFinished() {
      $target.trigger({type:"simulate-keySequence", sequence:sequence});
      if ($.isFunction(opts.callback)) {
        opts.callback.apply(target, [{sequence:sequence}]);
      }
    }
    function processNextToken() {
      var timeElapsed = now() - lastTime;
      if (timeElapsed >= opts.delay) {
        var match = tokenRegExp.exec(sequence);
        if (match !== null) {
          var s = match[0];
          (localkeys[s] || ($.simulate.prototype.simulateKeySequence.defaults[s] || $.simulate.prototype.simulateKeySequence.defaults.simplechar))(rng, s, opts);
          setTimeout(processNextToken, opts.delay);
        } else {
          sequenceFinished();
        }
        lastTime = now();
      } else {
        setTimeout(processNextToken, opts.delay - timeElapsed);
      }
    }
    if (!opts.delay || opts.delay <= 0) {
      sequence.replace(/\{[^}]*\}|[^{]+/g, function(s) {
        (localkeys[s] || ($.simulate.prototype.simulateKeySequence.defaults[s] || $.simulate.prototype.simulateKeySequence.defaults.simplechar))(rng, s, opts);
      });
      sequenceFinished();
    } else {
      var tokenRegExp = /\{[^}]*\}|[^{]/g;
      var now = Date.now || function() {
        return(new Date).getTime();
      }, lastTime = now();
      processNextToken();
    }
  }});
  $.extend($.simulate.prototype.simulateKeySequence.prototype, {IEKeyCodeTable:{33:49, 64:50, 35:51, 36:52, 37:53, 94:54, 38:55, 42:56, 40:57, 41:48, 59:186, 58:186, 61:187, 43:187, 44:188, 60:188, 45:189, 95:189, 46:190, 62:190, 47:191, 63:191, 96:192, 126:192, 91:219, 123:219, 92:220, 124:220, 93:221, 125:221, 39:222, 34:222}, charToKeyCode:function(character) {
    var specialKeyCodeTable = $.simulate.prototype.simulateKeySequence.prototype.IEKeyCodeTable;
    var charCode = character.charCodeAt(0);
    if (charCode >= 64 && charCode <= 90 || charCode >= 48 && charCode <= 57) {
      return charCode;
    } else {
      if (charCode >= 97 && charCode <= 122) {
        return character.toUpperCase().charCodeAt(0);
      } else {
        if (specialKeyCodeTable[charCode] !== undefined) {
          return specialKeyCodeTable[charCode];
        } else {
          return charCode;
        }
      }
    }
  }});
  $.simulate.prototype.simulateKeySequence.defaults = {simplechar:function(rng, s, opts) {
    rng.text(s, "end");
    if (opts.triggerKeyEvents) {
      for (var i = 0;i < s.length;i += 1) {
        var charCode = s.charCodeAt(i);
        var keyCode = $.simulate.prototype.simulateKeySequence.prototype.charToKeyCode(s.charAt(i));
        $(rng._el).simulate("keydown", {keyCode:keyCode});
        $(rng._el).simulate("keypress", {keyCode:charCode, which:charCode, charCode:charCode});
        $(rng._el).simulate("keyup", {keyCode:keyCode});
      }
    }
  }, "{{}":function(rng, s, opts) {
    $.simulate.prototype.simulateKeySequence.defaults.simplechar(rng, "{", opts);
  }, "{enter}":function(rng, s, opts) {
    rng.insertEOL();
    rng.select();
    if (opts.triggerKeyEvents === true) {
      $(rng._el).simulate("keydown", {keyCode:13});
      $(rng._el).simulate("keypress", {keyCode:13, which:13, charCode:13});
      $(rng._el).simulate("keyup", {keyCode:13});
    }
  }, "{backspace}":function(rng, s, opts) {
    var b = rng.bounds();
    if (b[0] === b[1]) {
      rng.bounds([b[0] - 1, b[0]]);
    }
    rng.text("", "end");
    if (opts.triggerKeyEvents === true) {
      $(rng._el).simulate("keydown", {keyCode:8});
      $(rng._el).simulate("keyup", {keyCode:8});
    }
  }, "{del}":function(rng, s, opts) {
    var b = rng.bounds();
    if (b[0] === b[1]) {
      rng.bounds([b[0], b[0] + 1]);
    }
    rng.text("", "end");
    if (opts.triggerKeyEvents === true) {
      $(rng._el).simulate("keydown", {keyCode:46});
      $(rng._el).simulate("keyup", {keyCode:46});
    }
  }, "{rightarrow}":function(rng, s, opts) {
    var b = rng.bounds();
    if (b[0] === b[1]) {
      b[1] += 1;
    }
    rng.bounds([b[1], b[1]]).select();
    if (opts.triggerKeyEvents === true) {
      $(rng._el).simulate("keydown", {keyCode:39});
      $(rng._el).simulate("keyup", {keyCode:39});
    }
  }, "{leftarrow}":function(rng, s, opts) {
    var b = rng.bounds();
    if (b[0] === b[1]) {
      b[0] -= 1;
    }
    rng.bounds([b[0], b[0]]).select();
    if (opts.triggerKeyEvents === true) {
      $(rng._el).simulate("keydown", {keyCode:37});
      $(rng._el).simulate("keyup", {keyCode:37});
    }
  }, "{selectall}":function(rng) {
    rng.bounds("all").select();
  }};
  $(document).ready(function() {
    var testDiv = $("<div/>").css({height:1, width:1, position:"absolute", left:-1E3, top:-1E3}).appendTo("body");
    testDiv.simulate("key-sequence", {sequence:"\u00a0 \u00a0", delay:1, callback:function() {
      quirks.delayedSpacesInNonInputGlitchToEnd = testDiv.text().indexOf(" ") > 1;
      testDiv.remove();
    }});
  });
})(jQuery);