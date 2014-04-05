(function() {
  $.expr[":"].containsexactly = function(obj, index, meta, stack) {
    return $(obj).text() === meta[3];
  };
  window.__bitium_Page = function() {
    var $selectors;
    function __bitium_Page() {
      this.last_input;
      this.scope = $(document);
    }
    $selectors = {link:function(locator) {
      return["a[id='" + locator + "']", "a:containsexactly('" + locator + "')", "a[title='" + locator + "']"];
    }, form_field:function(locator) {
      return["input:not(:submit,:image,:hidden)[id='" + locator + "']", "input:not(:submit,:image,:hidden)[name='" + locator + "']", "input:not(:submit,:image,:hidden)[placeholder='" + locator + "']", "textarea[id='" + locator + "']", "textarea[name='" + locator + "']", "textarea[placeholder='" + locator + "']", "select[id='" + locator + "']", "select[name='" + locator + "']", "select[placeholder='" + locator + "']"];
    }, button:function(locator) {
      return["input[type='submit'][id='" + locator + "']", "input[type='submit'][value='" + locator + "']", "input[type='submit'][title='" + locator + "']", "input[type='submit'][name='" + locator + "']", "input[type='reset'][id='" + locator + "']", "input[type='reset'][value='" + locator + "']", "input[type='reset'][title='" + locator + "']", "input[type='image'][id='" + locator + "']", "input[type='image'][value='" + locator + "']", "input[type='image'][title='" + locator + "']", "input[type='button'][id='" + 
      locator + "']", "input[type='button'][value='" + locator + "']", "input[type='button'][title='" + locator + "']", "button[id='" + locator + "']", "button[value='" + locator + "']", "button:containsexactly('" + locator + "')", "button[title='" + locator + "']", "button[name='" + locator + "']", "input[type='image'][alt='" + locator + "']"];
    }, fillable_field:function(locator) {
      return["input:not(:submit,:image,:radio,:checkbox,:hidden,:file)[id='" + locator + "']", "input:not(:submit,:image,:radio,:checkbox,:hidden,:file)[name='" + locator + "']", "input:not(:submit,:image,:radio,:checkbox,:hidden,:file)[placeholder='" + locator + "']", "textarea[id='" + locator + "']", "textarea[name='" + locator + "']", "textarea[placeholder='" + locator + "']"];
    }, hidden_fillable_field:function(locator) {
      return["input:not(:submit,:image,:radio,:checkbox,:file)[id='" + locator + "']", "input:not(:submit,:image,:radio,:checkbox,:file)[name='" + locator + "']", "input:not(:submit,:image,:radio,:checkbox,:file)[placeholder='" + locator + "']", "textarea[id='" + locator + "']", "textarea[name='" + locator + "']", "textarea[placeholder='" + locator + "']"];
    }, checked_field:function(locator) {
      return["input:not(:submit,:image,:text,:password,:hidden,:file)[id='" + locator + "']:checked", "input:not(:submit,:image,:text,:password,:hidden,:file)[name='" + locator + "']:checked"];
    }, unchecked_field:function(locator) {
      return["input:not(:submit,:image,:text,:password,:hidden,:file)[id='" + locator + "']:not(:checked)", "input:not(:submit,:image,:text,:password,:hidden,:file)[name='" + locator + "']:not(:checked)"];
    }, checkbox:function() {
      return["input:not(:submit,:image,:text,:password,:hidden,:radio,:file)[id='" + locator + "']", "input:not(:submit,:image,:text,:password,:radio,:hidden,:file)[name='" + locator + "']"];
    }, radio:function() {
      return["input:not(:submit,:image,:text,:password,:hidden,:checkbox,:file)[id='" + locator + "']", "input:not(:submit,:image,:text,:password,:checkbox,:hidden,:file)[name='" + locator + "']"];
    }, select:function(locator) {
      return["select[id='" + locator + "']", "select[name='" + locator + "']"];
    }, table:function(locator) {
      return["table[id='" + locator + "']"];
    }, link_or_button:function(locator) {
      return $selectors.link(locator).concat($selectors.button(locator));
    }, css:function(locator) {
      return["" + locator];
    }};
    __bitium_Page.prototype.do_visit = function(step, callback) {
      return callback(true);
    };
    __bitium_Page.prototype.getStepSelector = function(step) {
      var selector;
      selector = "css";
      switch(step.action) {
        case "fill_in":
          selector = "fillable_field";
          break;
        case "enter_on_last_step":
          selector = this.getStepSelector(this.last_input);
          break;
        case "submit":
          selector = this.getStepSelector(this.last_input);
          break;
        case "delayed_click":
          selector = "link_or_button";
          break;
        case "click":
          selector = "link_or_button";
          break;
        case "click_button":
          selector = "button";
          break;
        case "click_link":
          selector = "link";
          break;
        case "select":
          selector = "select";
          break;
        case "check":
          selector = "checkbox";
          break;
        case "uncheck":
          selector = "checkbox";
          break;
        case "choose":
          selector = "radio";
          break;
        case "select":
          selector = "select";
      }
      if (step.selector === "css" || step.format === "css") {
        selector = "css";
      }
      return selector;
    };
    __bitium_Page.prototype.run_step = function(step, callback) {
      var postConditionsTest, that;
      console.log("run_step " + step.action);
      that = this;
      postConditionsTest = function(testResult) {
        var _ref;
        if (!that["do_" + step.action]) {
          console.log("step doesn't exist " + step.action);
          callback(true);
        } else {
          if (step.action === "success") {
            console.log("success step");
            that.do_success(step, callback);
          } else {
            if (step.conditions && (!testResult && step.action !== "success")) {
              console.log("step with conditions that are not true");
              callback(true);
            } else {
              if (step.target && (step.target !== null && step.target !== "")) {
                console.log("step with target");
                step.selector = that.getStepSelector(step);
                return that.do_wait_for(step, function(result) {
                  var _ref;
                  console.log("wait_for " + step.action + " result " + result);
                  if (!result) {
                    return callback(result);
                  } else {
                    return(_ref = that["do_" + step.action]) != null ? _ref.call(that, step, callback) : void 0;
                  }
                });
              } else {
                console.log("step with no target");
                return(_ref = that["do_" + step.action]) != null ? _ref.call(that, step, callback) : void 0;
              }
            }
          }
        }
      };
      return this.testConditionsAsync(step, postConditionsTest);
    };
    __bitium_Page.prototype.do_fill_in = function(step, callback) {
      var field;
      this.last_input = step;
      field = this.find_basic("fillable_field", step);
      field.val("");
      if (step.mode != null && step.mode === "val_replace") {
        field.val(step.value);
      } else {
        field.simulate("key-sequence", {sequence:step.value});
      }
      return callback(true);
    };
    __bitium_Page.prototype.do_enter_on_last_step_reverted = function(step, callback) {
      var field;
      field = this.find_basic("fillable_field", this.last_input);
      field.simulate("keypress", {keyCode:13});
      return callback(true);
    };
    __bitium_Page.prototype.do_enter_on_last_step = function(step, callback) {
      var e, field, last_step;
      last_step = this.last_input;
      field = this.find_basic("fillable_field", last_step);
      e = $.Event("keypress");
      e.which = 13;
      e.keyCode = 13;
      field.trigger(e);
      return callback(true);
    };
    __bitium_Page.prototype.do_submit = function(step, callback) {
      var j, result;
      result = true;
      if (this.exists(this.last_input)) {
        j = this.find_basic("fillable_field", this.last_input);
        j.closest("form").submit();
        if (j.closest("form").length === 0) {
          result = false;
        }
      } else {
        $("form").first().submit();
        if ($("form").first().length === 0) {
          result = false;
        }
      }
      return callback(result);
    };
    __bitium_Page.prototype.do_delayed_click = function(step, callback) {
      var clickit, _this = this;
      clickit = function() {
        return _this.click(step, callback);
      };
      return setTimeout(clickit, step.value);
    };
    __bitium_Page.prototype.do_wait = function(step, callback) {
      var cb;
      cb = function() {
        return callback(true);
      };
      return setTimeout(cb, step.value * 1E3);
    };
    __bitium_Page.prototype.do_wait_for = function(step, callback) {
      if (step.type && (step.type === "success" || step.type === "error")) {
        callback(true);
      }
      this.timeout = step.timeout ? step.timeout : 5E3;
      console.log("wait_for " + this.timeout);
      this.timeout += bitiumDateNow();
      return this.wait_for_loop(step, callback);
    };
    __bitium_Page.prototype.wait_for_loop = function(step, callback) {
      var el, later, visible, _this = this;
      el = this.find_basic(step.selector, step);
      visible = el.is(":visible");
      if (visible === step.visible) {
        console.log("visibilty match: " + step.visible.toString() + " vs " + el.is(":visible").toString());
        return callback(true);
      } else {
        if (step.visible === void 0 && el.length > 0) {
          console.log("steps visibilty undefined");
          return callback(true);
        } else {
          if (step.visible) {
            console.log("visibilty doesnt match: " + step.visible.toString() + " vs " + el.is(":visible").toString());
          } else {
            console.log("element not present with undefined visibilty");
          }
          later = function() {
            return _this.wait_for_loop(step, callback);
          };
          if (this.timeout > bitiumDateNow()) {
            console.log("not detected, wait_for_loop again");
            return setTimeout(later, 500);
          } else {
            console.log("Timeout out waiting for element");
            return callback(false);
          }
        }
      }
    };
    __bitium_Page.prototype.do_keypress = function(step, callback) {
      var field;
      if (step.target) {
        field = this.find_basic("css", step);
      } else {
        field = $(document);
      }
      field.simulate("focus");
      field.simulate("keypress", {keyCode:step.value});
      return callback(true);
    };
    __bitium_Page.prototype.do_click = function(step, callback) {
      var target;
      console.log("click");
      target = this.find_basic("link_or_button", step);
      this.click_basic(target, step.mode);
      return callback(true);
    };
    __bitium_Page.prototype.click_basic = function(el, mode) {
      var event, options, opts;
      if (mode != null && mode === "jquery_click") {
        el.focus();
        return el.click();
      } else {
        if (el.length === 0) {
          return;
        }
        event = document.createEvent("MouseEvents");
        options = {};
        opts = {type:options.type || "click", canBubble:options.canBubble || true, cancelable:options.cancelable || false, view:options.view || document.defaultView, detail:options.detail || 1, screenX:options.screenX || 0, screenY:options.screenY || 0, clientX:options.clientX || 0, clientY:options.clientY || 0, ctrlKey:options.ctrlKey || false, altKey:options.altKey || false, shiftKey:options.shiftKey || false, metaKey:options.metaKey || false, button:options.button || 0, relatedTarget:options.relatedTarget || 
        null};
        event.initMouseEvent(opts.type, opts.canBubble, opts.cancelable, opts.view, opts.detail, opts.screenX, opts.screenY, opts.clientX, opts.clientY, opts.ctrlKey, opts.altKey, opts.shiftKey, opts.metaKey, opts.button, opts.relatedTarget);
        return el[0].dispatchEvent(event);
      }
    };
    __bitium_Page.prototype.do_click_button = function(step, callback) {
      var target;
      target = this.find_basic("button", step);
      this.click_basic(target, step.mode);
      return callback(true);
    };
    __bitium_Page.prototype.do_click_link = function(step, callback) {
      var target;
      target = this.find_basic("link", step);
      this.click_basic(target, step.mode);
      return callback(true);
    };
    __bitium_Page.prototype.do_check = function(step, callback) {
      var target;
      target = this.find_basic("checkbox", step);
      target.checked = true;
      return callback(true);
    };
    __bitium_Page.prototype.do_uncheck = function(step, callback) {
      var target;
      target = this.find_basic("checkbox", step);
      target.checked = false;
      return callback(true);
    };
    __bitium_Page.prototype.do_choose = function(step, callback) {
      var target;
      target = this.find_basic("radio", step);
      target.prop("checked", true);
      return callback(true);
    };
    __bitium_Page.prototype.do_select = function(step, callback) {
      var option, target, _i, _len, _ref;
      console.log("select!");
      target = this.find_basic("select", step);
      if (target.length > 0) {
        _ref = target[0].options;
        for (_i = 0, _len = _ref.length;_i < _len;_i++) {
          option = _ref[_i];
          if (option.value === step.value) {
            option.selected = true;
          }
        }
      }
      return callback(true);
    };
    __bitium_Page.prototype.do_unselect = function(step, callback) {
      var option, target, _i, _len, _ref;
      target = this.find_basic("select", step);
      if (target.length > 0) {
        _ref = target[0].options;
        for (_i = 0, _len = _ref.length;_i < _len;_i++) {
          option = _ref[_i];
          if (option.value === step.value) {
            option.selected = false;
          }
        }
      }
      return callback(true);
    };
    __bitium_Page.prototype.exists = function(step) {
      return!!(this.find_basic("fillable_field", step).length > 0);
    };
    __bitium_Page.prototype.find = function(step, callback) {
      this.do_wait_for(step, function(result) {
        return callback(result);
      });
      return this.find_basic(this.getStepSelector(step), step);
    };
    __bitium_Page.prototype.find_basic = function(selector, step) {
      var locator, selection, str;
      if (!step || !step.target) {
        return[];
      }
      console.log("find_basic: " + selector);
      locator = step.target;
      if (step.format === "css") {
        selector = "css";
      }
      if (selector === "fillable_field" && step.hidden) {
        selector = "hidden_fillable_field";
      }
      str = $selectors[selector](locator);
      selection = this.find_element(str).first();
      if (selection.length === 0) {
        console.log("Didn't find element for selector " + selector + " and locator " + locator);
        console.log("step: " + step.action);
      }
      return selection;
    };
    __bitium_Page.prototype.find_element = function(a) {
      var element, ex;
      try {
        element = this.scope.find(a.join(","));
      } catch (_error) {
        ex = _error;
        console.log("exception finding element: " + ex.message);
      }
      return element;
    };
    __bitium_Page.prototype.do_within = function(step, callback) {
      this.scope = $(step.target);
      return callback(true);
    };
    __bitium_Page.prototype.testConditionsAsync = function(step, callback) {
      var laterConditionsTest, that;
      if (!step.conditions || step.conditions.length === 0) {
        console.log("no conditions to test in testConditionsAsync");
        callback(true);
        return;
      }
      that = this;
      this.timeout = step.timeout ? step.timeout : 2E3;
      console.log("wait_for " + this.timeout);
      this.timeout += bitiumDateNow();
      laterConditionsTest = function() {
        var result;
        console.log("AAA " + that.timeout + "|" + bitiumDateNow());
        result = that.testConditions(step.conditions);
        if (that.timeout > bitiumDateNow()) {
          console.log("timing has not expired");
        }
        if (result === false && that.timeout > bitiumDateNow()) {
          console.log("rechecking condition");
          return setTimeout(laterConditionsTest, 250);
        } else {
          console.log("success condtion: " + result);
          return callback(result);
        }
      };
      return laterConditionsTest();
    };
    __bitium_Page.prototype.testConditions = function(conditions) {
      var condition, condition_result, result, _i, _len, _ref;
      result = true;
      for (_i = 0, _len = conditions.length;_i < _len;_i++) {
        condition = conditions[_i];
        if (result) {
          condition_result = (_ref = this["check_" + condition.type]) != null ? _ref.call(this, condition) : void 0;
          console.log("condtion " + condition.target + ": " + condition_result);
          if (condition_result === void 0) {
            console.log("undefined condition " + condition.type);
            condition_result = false;
          }
          result = condition_result;
        }
      }
      console.log("condtion: " + result);
      return result;
    };
    __bitium_Page.prototype.do_success = function(step, callback) {
      console.log("success: " + JSON.stringify(step));
      return this.testConditionsAsync(step, callback);
    };
    __bitium_Page.prototype.check_has_no_field = function(condition) {
      console.log("has_no_field");
      return this.find_basic("fillable_field", condition).length === 0;
    };
    __bitium_Page.prototype.check_has_field = function(condition) {
      console.log("has_field");
      return this.find_basic("fillable_field", condition).length > 0;
    };
    __bitium_Page.prototype.check_has_selector = function(condition) {
      return this.find_basic("css", condition).length > 0;
    };
    __bitium_Page.prototype.check_has_no_selector = function(condition) {
      return this.find_basic("css", condition).length === 0;
    };
    __bitium_Page.prototype.check_has_css = function(condition) {
      return this.check_has_selector(condition);
    };
    __bitium_Page.prototype.check_has_no_css = function(condition) {
      return this.check_has_no_selector(condition);
    };
    __bitium_Page.prototype.check_has_button = function(condition) {
      return this.find_basic("button", condition).length > 0;
    };
    __bitium_Page.prototype.check_has_no_button = function(condition) {
      return this.find_basic("button", condition).length === 0;
    };
    __bitium_Page.prototype.check_has_link = function(condition) {
      return this.find_basic("link", condition).length > 0;
    };
    __bitium_Page.prototype.check_has_no_link = function(condition) {
      return this.find_basic("link", condition).length === 0;
    };
    __bitium_Page.prototype.check_has_checked_field = function(condition) {
      return this.find_basic("checked_field", condition).length > 0;
    };
    __bitium_Page.prototype.check_has_no_checked_field = function(condition) {
      return this.find_basic("checked_field", condition).length === 0;
    };
    __bitium_Page.prototype.check_has_select = function(condition) {
      return this.find_basic("select", condition).length > 0;
    };
    __bitium_Page.prototype.check_has_no_select = function(condition) {
      return this.find_basic("select", condition).length === 0;
    };
    __bitium_Page.prototype.check_has_table = function(condition) {
      return this.find_basic("table", condition).length > 0;
    };
    __bitium_Page.prototype.check_has_no_table = function(condition) {
      return this.find_basic("table", condition).length === 0;
    };
    __bitium_Page.prototype.check_has_text = function(condition) {
      var selector;
      selector = "body:contains('" + condition.value + "')";
      condition.target = selector;
      return this.find_basic("css", condition).length > 0;
    };
    __bitium_Page.prototype.check_has_no_text = function(condition) {
      var selector;
      selector = "body:contains('" + condition.value + "')";
      condition.target = selector;
      return this.find_basic("css", condition).length === 0;
    };
    __bitium_Page.prototype.check_has_unchecked_field = function(condition) {
      return this.find_basic("unchecked_field", condition).length > 0;
    };
    __bitium_Page.prototype.check_has_no_unchecked_field = function(condition) {
      return this.find_basic("unchecked_field", condition).length === 0;
    };
    return __bitium_Page;
  }();
}).call(this);