import {Calculator} from "/js/calc.js";
"use strict";

new Calculator({
	elements: {
		original: document.getElementById("table1"),
		new: document.getElementById("table2"),
		final: false,
		calculate: document.getElementById("calculate"),
	}
}); 
