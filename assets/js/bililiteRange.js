(function() {
  bililiteRange = function(el, debug) {
    var ret;
    if (debug) {
      ret = new NothingRange;
    } else {
      if (document.selection) {
        ret = new IERange;
      } else {
        if (window.getSelection && el.setSelectionRange) {
          ret = new InputRange;
        } else {
          if (window.getSelection) {
            ret = new W3CRange;
          } else {
            ret = new NothingRange;
          }
        }
      }
    }
    ret._el = el;
    ret._textProp = textProp(el);
    ret._bounds = [0, ret.length()];
    return ret;
  };
  function textProp(el) {
    if (typeof el.value != "undefined") {
      return "value";
    }
    if (typeof el.text != "undefined") {
      return "text";
    }
    if (typeof el.textContent != "undefined") {
      return "textContent";
    }
    return "innerText";
  }
  function Range() {
  }
  Range.prototype = {length:function() {
    return this._el[this._textProp].replace(/\r/g, "").length;
  }, bounds:function(s) {
    if (s === "all") {
      this._bounds = [0, this.length()];
    } else {
      if (s === "start") {
        this._bounds = [0, 0];
      } else {
        if (s === "end") {
          this._bounds = [this.length(), this.length()];
        } else {
          if (s === "selection") {
            this.bounds("all");
            this._bounds = this._nativeSelection();
          } else {
            if (s) {
              this._bounds = s;
            } else {
              var b = [Math.max(0, Math.min(this.length(), this._bounds[0])), Math.max(0, Math.min(this.length(), this._bounds[1]))];
              return b;
            }
          }
        }
      }
    }
    return this;
  }, select:function() {
    this._nativeSelect(this._nativeRange(this.bounds()));
    return this;
  }, text:function(text, select) {
    if (arguments.length) {
      this._nativeSetText(text, this._nativeRange(this.bounds()));
      if (select == "start") {
        this.bounds([this._bounds[0], this._bounds[0]]);
        this.select();
      } else {
        if (select == "end") {
          this.bounds([this._bounds[0] + text.length, this._bounds[0] + text.length]);
          this.select();
        } else {
          if (select == "all") {
            this.bounds([this._bounds[0], this._bounds[0] + text.length]);
            this.select();
          }
        }
      }
      return this;
    } else {
      return this._nativeGetText(this._nativeRange(this.bounds()));
    }
  }, insertEOL:function() {
    this._nativeEOL();
    this._bounds = [this._bounds[0] + 1, this._bounds[0] + 1];
    return this;
  }};
  function IERange() {
  }
  IERange.prototype = new Range;
  IERange.prototype._nativeRange = function(bounds) {
    var rng;
    if (this._el.tagName == "INPUT") {
      rng = this._el.createTextRange();
    } else {
      rng = document.body.createTextRange();
      rng.moveToElementText(this._el);
    }
    if (bounds) {
      if (bounds[1] < 0) {
        bounds[1] = 0;
      }
      if (bounds[0] > this.length()) {
        bounds[0] = this.length();
      }
      if (bounds[1] < rng.text.replace(/\r/g, "").length) {
        rng.moveEnd("character", -1);
        rng.moveEnd("character", bounds[1] - rng.text.replace(/\r/g, "").length);
      }
      if (bounds[0] > 0) {
        rng.moveStart("character", bounds[0]);
      }
    }
    return rng;
  };
  IERange.prototype._nativeSelect = function(rng) {
    rng.select();
  };
  IERange.prototype._nativeSelection = function() {
    var rng = this._nativeRange();
    var len = this.length();
    if (document.selection.type != "Text") {
      return[len, len];
    }
    var sel = document.selection.createRange();
    try {
      return[iestart(sel, rng), ieend(sel, rng)];
    } catch (e) {
      return sel.parentElement().sourceIndex < this._el.sourceIndex ? [0, 0] : [len, len];
    }
  };
  IERange.prototype._nativeGetText = function(rng) {
    return rng.text.replace(/\r/g, "");
  };
  IERange.prototype._nativeSetText = function(text, rng) {
    rng.text = text;
  };
  IERange.prototype._nativeEOL = function() {
    if (typeof this._el.value != "undefined") {
      this.text("\n");
    } else {
      this._nativeRange(this.bounds()).pasteHTML("<br/>");
    }
  };
  function iestart(rng, constraint) {
    var len = constraint.text.replace(/\r/g, "").length;
    if (rng.compareEndPoints("StartToStart", constraint) <= 0) {
      return 0;
    }
    if (rng.compareEndPoints("StartToEnd", constraint) >= 0) {
      return len;
    }
    for (var i = 0;rng.compareEndPoints("StartToStart", constraint) > 0;++i, rng.moveStart("character", -1)) {
    }
    return i;
  }
  function ieend(rng, constraint) {
    var len = constraint.text.replace(/\r/g, "").length;
    if (rng.compareEndPoints("EndToEnd", constraint) >= 0) {
      return len;
    }
    if (rng.compareEndPoints("EndToStart", constraint) <= 0) {
      return 0;
    }
    for (var i = 0;rng.compareEndPoints("EndToStart", constraint) > 0;++i, rng.moveEnd("character", -1)) {
    }
    return i;
  }
  function InputRange() {
  }
  InputRange.prototype = new Range;
  InputRange.prototype._nativeRange = function(bounds) {
    return bounds || [0, this.length()];
  };
  InputRange.prototype._nativeSelect = function(rng) {
    this._el.setSelectionRange(rng[0], rng[1]);
  };
  InputRange.prototype._nativeSelection = function() {
    return[this._el.selectionStart, this._el.selectionEnd];
  };
  InputRange.prototype._nativeGetText = function(rng) {
    return this._el.value.substring(rng[0], rng[1]);
  };
  InputRange.prototype._nativeSetText = function(text, rng) {
    var val = this._el.value;
    this._el.value = val.substring(0, rng[0]) + text + val.substring(rng[1]);
  };
  InputRange.prototype._nativeEOL = function() {
    this.text("\n");
  };
  function W3CRange() {
  }
  W3CRange.prototype = new Range;
  W3CRange.prototype._nativeRange = function(bounds) {
    var rng = document.createRange();
    rng.selectNodeContents(this._el);
    if (bounds) {
      w3cmoveBoundary(rng, bounds[0], true, this._el);
      rng.collapse(true);
      w3cmoveBoundary(rng, bounds[1] - bounds[0], false, this._el);
    }
    return rng;
  };
  W3CRange.prototype._nativeSelect = function(rng) {
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(rng);
  };
  W3CRange.prototype._nativeSelection = function() {
    var rng = this._nativeRange();
    if (window.getSelection().rangeCount == 0) {
      return[this.length(), this.length()];
    }
    var sel = window.getSelection().getRangeAt(0);
    return[w3cstart(sel, rng), w3cend(sel, rng)];
  };
  W3CRange.prototype._nativeGetText = function(rng) {
    return rng.toString();
  };
  W3CRange.prototype._nativeSetText = function(text, rng) {
    rng.deleteContents();
    rng.insertNode(document.createTextNode(text));
    this._el.normalize();
  };
  W3CRange.prototype._nativeEOL = function() {
    var rng = this._nativeRange(this.bounds());
    rng.deleteContents();
    var br = document.createElement("br");
    br.setAttribute("_moz_dirty", "");
    rng.insertNode(br);
    rng.insertNode(document.createTextNode("\n"));
    rng.collapse(false);
  };
  function nextnode(node, root) {
    if (node.firstChild) {
      return node.firstChild;
    }
    if (node.nextSibling) {
      return node.nextSibling;
    }
    if (node === root) {
      return null;
    }
    while (node.parentNode) {
      node = node.parentNode;
      if (node == root) {
        return null;
      }
      if (node.nextSibling) {
        return node.nextSibling;
      }
    }
    return null;
  }
  function w3cmoveBoundary(rng, n, bStart, el) {
    if (n <= 0) {
      return;
    }
    var node = rng[bStart ? "startContainer" : "endContainer"];
    if (node.nodeType == 3) {
      n += rng[bStart ? "startOffset" : "endOffset"];
    }
    while (node) {
      if (node.nodeType == 3) {
        if (n <= node.nodeValue.length) {
          rng[bStart ? "setStart" : "setEnd"](node, n);
          if (n == node.nodeValue.length) {
            for (var next = nextnode(node, el);next && (next.nodeType == 3 && next.nodeValue.length == 0);next = nextnode(next, el)) {
              rng[bStart ? "setStartAfter" : "setEndAfter"](next);
            }
            if (next && (next.nodeType == 1 && next.nodeName == "BR")) {
              rng[bStart ? "setStartAfter" : "setEndAfter"](next);
            }
          }
          return;
        } else {
          rng[bStart ? "setStartAfter" : "setEndAfter"](node);
          n -= node.nodeValue.length;
        }
      }
      node = nextnode(node, el);
    }
  }
  var START_TO_START = 0;
  var START_TO_END = 1;
  var END_TO_END = 2;
  var END_TO_START = 3;
  function w3cstart(rng, constraint) {
    if (rng.compareBoundaryPoints(START_TO_START, constraint) <= 0) {
      return 0;
    }
    if (rng.compareBoundaryPoints(END_TO_START, constraint) >= 0) {
      return constraint.toString().length;
    }
    rng = rng.cloneRange();
    rng.setEnd(constraint.endContainer, constraint.endOffset);
    return constraint.toString().length - rng.toString().length;
  }
  function w3cend(rng, constraint) {
    if (rng.compareBoundaryPoints(END_TO_END, constraint) >= 0) {
      return constraint.toString().length;
    }
    if (rng.compareBoundaryPoints(START_TO_END, constraint) <= 0) {
      return 0;
    }
    rng = rng.cloneRange();
    rng.setStart(constraint.startContainer, constraint.startOffset);
    return rng.toString().length;
  }
  function NothingRange() {
  }
  NothingRange.prototype = new Range;
  NothingRange.prototype._nativeRange = function(bounds) {
    return bounds || [0, this.length()];
  };
  NothingRange.prototype._nativeSelect = function(rng) {
  };
  NothingRange.prototype._nativeSelection = function() {
    return[0, 0];
  };
  NothingRange.prototype._nativeGetText = function(rng) {
    return this._el[this._textProp].substring(rng[0], rng[1]);
  };
  NothingRange.prototype._nativeSetText = function(text, rng) {
    var val = this._el[this._textProp];
    this._el[this._textProp] = val.substring(0, rng[0]) + text + val.substring(rng[1]);
  };
  NothingRange.prototype._nativeEOL = function() {
    this.text("\n");
  };
})();