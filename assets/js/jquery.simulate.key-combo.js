(function($, undefined) {
  var ModifierKeyCodes = {SHIFT:16, CONTROL:17, ALT:18, COMMAND:91};
  $.extend($.simulate.prototype, {simulateKeyCombo:function() {
    var target = $(this.target), options = $.extend({combo:"", eventsOnly:false}, this.options), eventOptions = {}, combo = options.combo, comboSplit = combo.split(/(\+)/), plusExpected = false, holdKeys = [], i;
    if (combo.length === 0) {
      return;
    }
    comboSplit = $.grep(comboSplit, function(part) {
      return part !== "";
    });
    for (i = 0;i < comboSplit.length;i += 1) {
      var key = comboSplit[i], keyLowered = key.toLowerCase();
      if (plusExpected) {
        if (key !== "+") {
          throw'Syntax error: expected "+"';
        }
      } else {
        var keyCode;
        switch(keyLowered) {
          case "ctrl":
          ;
          case "alt":
          ;
          case "shift":
          ;
          case "meta":
            switch(keyLowered) {
              case "ctrl":
                keyCode = ModifierKeyCodes.CONTROL;
                break;
              case "alt":
                keyCode = ModifierKeyCodes.ALT;
                break;
              case "shift":
                keyCode = ModifierKeyCodes.SHIFT;
                break;
              case "meta":
                keyCode = ModifierKeyCodes.COMMAND;
                break;
            }
            eventOptions[keyLowered + "Key"] = true;
            holdKeys.unshift(keyCode);
            eventOptions.keyCode = keyCode;
            target.simulate("keydown", eventOptions);
            break;
          default:
            if (key.length > 1) {
              throw'Syntax error: expecting "+" between each key';
            } else {
              keyCode = $.simulate.prototype.simulateKeySequence.prototype.charToKeyCode(key);
              holdKeys.unshift(keyCode);
              eventOptions.keyCode = keyCode;
              eventOptions.which = keyCode;
              eventOptions.charCode = undefined;
              target.simulate("keydown", eventOptions);
              if (eventOptions.shiftKey) {
                key = key.toUpperCase();
              }
              eventOptions.keyCode = key.charCodeAt(0);
              eventOptions.charCode = eventOptions.keyCode;
              eventOptions.which = eventOptions.keyCode;
              target.simulate("keypress", eventOptions);
              if (options.eventsOnly !== true && (!eventOptions.ctrlKey && (!eventOptions.altKey && !eventOptions.metaKey))) {
                target.simulate("key-sequence", {sequence:key, triggerKeyEvents:false});
              }
            }
            break;
        }
      }
      plusExpected = !plusExpected;
    }
    if (!plusExpected) {
      throw'Syntax error: expected key (trailing "+"?)';
    }
    eventOptions.charCode = undefined;
    for (i = 0;i < holdKeys.length;i += 1) {
      eventOptions.keyCode = holdKeys[i];
      eventOptions.which = holdKeys[i];
      switch(eventOptions.keyCode) {
        case ModifierKeyCodes.ALT:
          eventOptions.altKey = false;
          break;
        case ModifierKeyCodes.SHIFT:
          eventOptions.shiftKey = false;
          break;
        case ModifierKeyCodes.CONTROL:
          eventOptions.ctrlKey = false;
          break;
        case ModifierKeyCodes.COMMAND:
          eventOptions.metaKey = false;
          break;
        default:
          break;
      }
      target.simulate("keyup", eventOptions);
    }
  }});
})(jQuery);