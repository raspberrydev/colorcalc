"use strict";

var _calc = require("/js/calc.js");

new _calc.Calculator({
  elements: {
    original: document.getElementById("table1"),
    new: document.getElementById("table2"),
    final: false,
    calculate: document.getElementById("calculate")
  }
});
