const config = {
	colorants: {
		"B1": "Black",
		"L1": "Blue",
		"Y3": "Deep Gold",
		"R3": "Magenta",
		"R2": "Maroon",
		"G2": "New Green",
		"R4": "New Red",
		"N1": "Raw Umber",
		"W1": "White",
		"Y1": "Yellow"
	},
	header: {
		ids: ["colorant", "oz", "32", "64", "128"],
		titles: ["Colorant", "OZ", "32", "64", "128"]
	},
	focus: {
		retainer: document.getElementById("tab-retainer"),
		anchor: document.getElementById("tab-anchor")
	},
	lookup: document.getElementById("lookup"),
	lookupTable: document.getElementById("colorants"),
	rowCount: 5
};

function Calculator() {
    this.focusableElements = [];
	this.resultsDisplayOpen = false;
	this.colorantLookupOpen = false;
	this.colorantLookupSelected = 0;
	this.colorantLookupElement = false;
	this.originalColor = false;
	this.newColor = false;

	this.start = (setup) => {
		this.generateFocusableElements();

		config.focus.retainer.addEventListener("focus", () => {
			this.focusableElements[0].focus();
		});

		config.focus.anchor.addEventListener("focus", () => {
			this.focusableElements[
				this.focusableElements.length - 1
			].focus();
		});

		document.body.addEventListener("DOMSubtreeModified", () => this.generateFocusableElements())

		setup.elements.original.appendChild(
			this.createColorTable(0)
		)

		this.originalColor = setup.elements.original.firstElementChild;

		setup.elements.new.appendChild(
			this.createColorTable(config.rowCount) // using config.rowCount to offset ids
		)

		this.newColor = setup.elements.new.firstElementChild;

		this.focusableElements[0].focus();

		this.setupLookup();

		this.bindInputs();

		setup.elements.calculate.addEventListener("click", this.calculate);
	};
	
	this.id = () => "_" + Math.random().toString(36).substr(2, 4);
	
	this.generateFocusableElements = () => {
		this.focusableElements = Array.from(document.querySelectorAll(
			`a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])`
		)).filter(el => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden"));
		this.focusableElements.shift(); // Remove first (span)
		this.focusableElements.pop(); // Remove last (span)
	};

	this.setupLookup = () => {
		let headers = [
			"ID", "Colorant Name"
		];

		let div = document.createElement("div");
		div.className = "header";

		for(let header of headers) {
			let element = document.createElement("div");
			element.innerHTML = header;
			div.appendChild(element);
		}

		config.lookupTable.appendChild(div);

		for(let colorant in config.colorants) {

			let div = document.createElement("div");
			div.className = "row";


			let id = document.createElement("div");
			id.innerHTML = colorant;
			div.appendChild(id);

			let name = document.createElement("div");
			name.innerHTML = config.colorants[colorant];
			div.appendChild(name);


			if(colorant == "B1") div.classList.add("selected");

			config.lookupTable.appendChild(div);
		}		
	}

	/**
	 * Divides two numbers and returns total, whole number and remainder
	 * @param {number} x
	 * @param {number} y
	 * @returns The result, whole number & remainder.
	 */

	this.divide = (x, y) => {
		let result = x / y;
		return {
			result: +(result.toFixed(10)),
			whole: +(~~(result)),
			remainder: +(result - ~~(result)).toFixed(10)
		};
	};

	/**
	 * Splits an array into specifically sized chunks
	 * @param {array} arr Array to chunk
	 * @param {int} bulkSize Size of each cunk
	 * @returns Array of chunks
	 */

	this.chunkSplit = (arr, bulkSize = 20) => {
		let bulks = [];
		for (let i = 0; i < Math.ceil(arr.length / bulkSize); i++) {
			bulks.push(arr.slice(i * bulkSize, (i + 1) * bulkSize));
		}
		return bulks;
	};

	/**
	 * Find the next or previous item in array from element
	 * @param {int} direction Positive/Negative 1 to determine direction
	 * @param {array} array Array to search
	 * @param {any} item Item to search for
	 * @returns Item or itself if last index
	 */

	this.find = (direction, array, item) => {
		let items = array.filter(element => !element.readOnly);
		let index = items.indexOf(item);
		if(direction > 0) {
			return (index + 1) == items.length ? 
				item : items[index + 1];
		} else if(direction < 0) {
			return index == 0 ? 
				item : items[index - 1];
		}
	};

	/**
	 * Finds an element below another in the DOM tree
	 * @param {any} element Element to search after
	 * @param {func} search Function to find what to return
	 * @returns Found item
	 */

	this.findElementAfter = (element, search) => {
		let all = Array.from(document.querySelectorAll("*"));
		let index = all.indexOf(element);
		let after = all.slice(index + 1);
		return after.find(search)
	};

	/**
	 * Searches from the top to the bottom of the DOM tree
	 * @param {func} search Function to find what to return
	 * @returns Found item
	 */

	this.findElementBefore = (element, search) => {
		let all = Array.from(document.querySelectorAll("*"));
		all = all.reverse();
		let index = all.indexOf(element);
		let after = all.slice(index + 1);
		return after.find(search)
	};

	/**
	 * Converts colorant arrays to decimals and vice-versa.
	 * @param {array} colorant Colorant to convert
	 * @param {boolean} check Enables a double-check to ensure accuracy
	 * @returns Array or Decimal
	 */

	this.convertColorant = (colorant, check) => {
		if(typeof colorant === "number") {
			let oz = ~~colorant,
			dec1 = this.divide(this.divide(colorant - oz, 1/128).result, 4), c32 = dec1.whole,
			dec2 = this.divide(dec1.remainder, 1/2), c64 = dec2.whole,
			dec3 = this.divide(dec2.remainder, 1/2), c128 = dec3.whole;

		if(check && (oz + c32/32 + c64/64 + c128/128) !== colorant) {
			throw new Error("Decimal to colorant mismatch.");
		}

		return [oz, c32, c64, c128];

		} else if(typeof colorant === "object") {
			return (colorant[1] + (colorant[2] / 32) + (colorant[3] / 64) + (colorant[4] / 128))
		}
	};

	/**
	 * Subtracts two colorants
	 * @param {colorant} colorant1 Original color colorant
	 * @param {colorant} colorant2 New color colorant
	 * @returns Subtracted result, decimal value, and if it is possible.
	 */

	this.subtractColorants = (colorant1, colorant2) => {
		let d1 = this.convertColorant(colorant1);
		let d2 = this.convertColorant(colorant2);
		let result = d2 - d1;
		let colorant0 = this.convertColorant(result);
		colorant0.unshift(colorant1[0]);
		colorant0.push(result);
		colorant0.push(result > 0);
		return colorant0;
	};

	/**
	 * Validates a colorant, and updates its name input if it is
	 * @param {HTML input} element Input to check
	 * @returns If the colorant entered is valid
	 */

	this.isColorant = (element) => {
		let id = element.value;

		let table = this.findElementBefore(element, (x) => x.classList.contains("color"));

		let isUnique = (table, id) => { // Prevent duplicate colorants
			let colorants = Array.from(table.querySelectorAll(".input.cid"))
			let codes = [];
			for(let code of colorants) codes.push(code.value.toUpperCase())
			codes = codes.filter(i => i);
			codes.splice(-1); // Remove the colorant just added
			return !codes.find(x => x == id.toUpperCase())
		};

		if(/^([a-zA-Z]{1}[0-9]{1})$/.test(id) && config.colorants.hasOwnProperty(id.toUpperCase()) && isUnique(table, id)) {
			let elements = Array.from(document.getElementsByTagName("input"));
			elements[elements.indexOf(element) + 1].value = config.colorants[id.toUpperCase()]
			element.value = id.toUpperCase();
			return true;
		} else {
			return false;
		}
	};

	/**
	 * Creates an input (or set of them) for a color table
	 * @param {string} id Input id
	 * @param {string} size Input size type
	 * @returns HTML input/div element
	 */

	this.createInput = (rid, size, cid) => {
		let div = document.createElement("div");

		if(!(size == "colorant")) {
			let input = document.createElement("input");

			Object.assign(input, {
				type: "text",
				className: `c${size} input`,
				id: `c${rid}-${size}`,
				pattern: "\\d*",
				maxLength: size.length
			});

			let dataset = {
				numeric: "",
				amount: "",
				size, rid, cid, input: ""
			};

			for(let point in dataset) {
				input.setAttribute(`data-${point}`, dataset[point])
			}

			div.appendChild(input);
		} else {
			let input = document.createElement("input");
			let name = document.createElement("input");

			div.setAttribute("class", size);

			Object.assign(input, {
				type: "text",
				className: `cid ${size} input`,
				id: `c${rid}-id`,
				pattern: "[aA][0-9]{2}",
				maxLength: 2,
				spellcheck: false
			});

			Object.assign(name, {
				type: "text",
				className: `cfn`,
				id: `c${rid}-fn`,
				readOnly: true,
				tabIndex: "-1"
			});

			let datasetA = {
				colorant: "", rid, cid
			};

			let datasetB = {rid, cid};

			for(let point in datasetA) {
				input.setAttribute(`data-${point}`, datasetA[point])
			}

			for(let point in datasetB) {
				name.setAttribute(`data-${point}`, datasetB[point])
			}

			div.appendChild(input);
			div.appendChild(name);
		}
		return div;
	};

	/**
	 * Creates a color table header
	 * @returns HTML div header
	 */

	this.createHeader = () => {
		let div = document.createElement("div");
		div.className = "header";

		for(let header of config.header.ids) {
			let element = document.createElement("div");
			element.className = parseInt(header) ? "_" + header : header;
			element.innerHTML = config.header.titles[config.header.ids.indexOf(header)];
			div.appendChild(element);
		}

		return div;
	};

	/**
	 * Creates a row for a color table
	 * @param {string} id Row id
	 * @returns A row of HTML inputs/divs
	 */

	this.createRow = (cid) => {
		let columns = [];
		let rid = this.id();
		for(let type of config.header.ids) { 
			columns.push(this.createInput(rid, type, cid));
		}
		return columns;
	};

	this.createResultRow = (colorant) => {
		let columns = [];
		for(let index in config.header.ids) { 
			let value = colorant[index];
			value = (value == 0) ? "" : value;
			columns.push(this.createResultInput(config.header.ids[index], value));
		}
		return columns;
	};

	this.createResultInput = (size, value) => {
		let div = document.createElement("div");

		if(!(size == "colorant")) {
			let input = document.createElement("input");

			Object.assign(input, {
				type: "text",
				className: `c${size} ${value < 0 ? "negative" : ""}`,
				readOnly: true,
				tabIndex: "-1"
			});

			input.setAttribute("value", value);

			div.appendChild(input);
		} else {
			let input = document.createElement("input");
			let name = document.createElement("input");

			div.setAttribute("class", size);

			input.setAttribute("value", value);
			name.setAttribute("value", config.colorants[value]);

			Object.assign(input, {
				type: "text",
				className: "cid",
				readOnly: true,
				tabIndex: "-1"
			});


			Object.assign(name, {
				type: "text",
				className: "cfn",
				readOnly: true,
				tabIndex: "-1"
			});


			div.appendChild(input);
			div.appendChild(name);

		}
		return div;
	};

	this.createResultTable = (colorants) => {
		let table = document.createElement("div");

		table.className = "results";

		let header = this.createHeader();
		table.appendChild(header);

		for(let i = 0; i < colorants.length; i++) {
			let row = document.createElement("div");
			row.className = "row";
			let columns = this.createResultRow(colorants[i]);

			for(let column of columns) {
				row.appendChild(column);
			}

			table.appendChild(row);
		}

		return table;
	};

	/**
	 * Creates a color input table
	 * @param {int} startId Starting row id
	 * @returns HTML div containing color table
	 */

	this.createColorTable = () => {
		let table = document.createElement("div");
		table.className = "color";

		let cid = this.id();

		table.dataset.id = cid;
		table.id = cid;

		let rowCount = config.rowCount;

		let header = this.createHeader();
		table.appendChild(header);

		for(let i = 0; i < rowCount; i++) {
			let row = document.createElement("div");
			row.className = "row";
			let columns = this.createRow(cid);

			for(let column of columns) {
				row.appendChild(column);
			}

			table.appendChild(row);
		}

		return table;
	};

	/**
	 * Decodes an HTML color input table to an array of colorants
	 * @param {HTML div} element Color table element
	 * @returns Array of all entered colorants and values
	 */

	this.decodeColorantTable = (element) => {
		let table = this.chunkSplit(Array.from(element.querySelectorAll("input")), 6);

		for(let row of table) row.splice(1, 1);
		return table.map(row => row.map(item => item.value).map( // Convert from object to value
				item => (item == "")  ? 0 : item // Set empty quotes to zeros, except for index of 0 (colorant)
			).map((item, index) => {
				return index == 0 ? item : +item // Convert strings to integers
			})
		).filter((x) => x[0]); // Remove rows without colorant (where 0th item is falsy)
	};

	/**
	 * Get colorant from color or check if it exists
	 * @param {color} color Table color array
	 * @param {string} id Colorant id
	 * @returns The colorant if found, false otherwise
	 */

	this.getColorant = (color, id) => {
		for(let colorant of color) {
			if(colorant[0] == id) return colorant;
		}
		return false;
	};

	this.calculate = () => {
		let color1 = this.decodeColorantTable(this.originalColor);
		let color2 = this.decodeColorantTable(this.newColor);

		let similar = []; // List of similar colorants
		let different1 = []; // List of non matching colorants from new color
		let different2 = []; // List of non matching colorants from original color BAD

		for(let x of color1) {
			if(this.getColorant(color2, x[0])) {
				similar.push(this.getColorant(color2, x[0]))
			} else {
				different1.push(this.getColorant(color1, x[0]))
			}
		}

		//console.log(similar);

		for(let x of color2) {
			if(this.getColorant(color1, x[0])) {
				if(!similar.find(y => y[0] == x[0])) {
					similar.push(this.getColorant(color1, x[0]))
				}
			} else {
				different2.push(this.getColorant(color2, x[0]))
			}
		}

		// 			similar, 	original has, 	new has
		//console.log(similar, 	different1, 	different2);

		let similarColorants = [];

		for(let color of similar) {
			//console.log(color)
			similarColorants.push([
				this.getColorant(color1, color[0]),
				this.getColorant(color2, color[0]),
			])
		}


		let subtractedAdditions = [];

		for(let color of similarColorants) {
			//console.log(color);
			//console.log(this.subtractColorants(color[0], color[1]));
			subtractedAdditions.push(this.subtractColorants(color[0], color[1]));
		}

		let totalAdditions = [...subtractedAdditions, ...different2];

		document.getElementById("final-table").innerHTML = "";
		document.getElementById("missing-table").innerHTML = "";

		document.getElementById("info").innerHTML = `There are <strong>${similar.length} shared colorants</strong>.${different1.length > 0 ? `<br>There are <strong>${different1.length} new colorants</strong>.` : ``}${different2.length > 0 ? `<br><span class="missing-paragraph">There are <strong>${different2.length} colorants missing</strong>.<br>(May change color).<br></span>` : ``}`;

		document.getElementById("final-table").appendChild(
			this.createResultTable(totalAdditions)
		);

		if(different1.length < 1) {
			document.getElementById("missing-header").style.display = "none";
			document.getElementById("missing-text").style.display = "none";
		} else {
			document.getElementById("missing-header").style.display = "block";
			document.getElementById("missing-text").style.display = "block";
			document.getElementById("missing-table").appendChild(
				this.createResultTable(different1)
			);
		}

		this.resultsDisplayOpen = true;
		document.getElementById("results").style.display = "block";



	};

	/**
	 * Binds all inputs with their validation code
	 * @returns {null}
	 */

	this.bindInputs = (refresh) => {
		/**
		 * Fuck these stupid ass browsers. There's no function to get event listeners or to
		 * get rid of all of them for an element so I have to write some stupid code that
		 * shouldn't even need to be even thought of in the first place. 
		 */
		refresh ? Array.from(document.querySelectorAll("input")).forEach(input => {
			input.removeEventListener("focus", input._focus, false);
			input.removeEventListener("blur", input._blur, false);
			input.removeEventListener("input", input._input, false);
			input.removeEventListener("keydown", input._keydown, false);
		}) : "";

		refresh ? (() => {
			document.removeEventListener("keydown", document._keydown, false);
			document.removeEventListener("mousedown", document._mousedown, false);
			document.removeEventListener("mousedown", document._mousedown, false);
		})() : "";

		Array.from(document.querySelectorAll("input")).forEach(input => {
			input.addEventListener("focus", input._focus = event => {
				if(!event.target.classList.contains("cfn")) event.target.select(); // When the user focuses on an input, select contents.
			}, false);

			input.addEventListener("input", input._input = event => {
				if("numeric" in event.target.dataset) { // If input has numeric tag, force its value to match
					event.target.value = event.target.value.replace(/[^0-9]/g, "");
				}
			}, false);

			input.addEventListener("keydown", input._keydown = event => {
				event.target.classList.remove("error");
				let elements = Array.from(document.querySelectorAll("input", true));

				if(event.key == "ArrowDown" && event.target.tagName.toLowerCase() == "input" && !this.colorantLookupOpen) {
					let next = this.findElementAfter(event.target, (x) => 
						x.className == event.target.className
					)
					next ? next.focus() : "";
					return;
				}

				if(event.key == "ArrowUp" && event.target.tagName.toLowerCase() == "input" && !this.colorantLookupOpen) {
					let before = this.findElementBefore(event.target, (x) => 
						x.className == event.target.className
					);
					before ? before.focus() : "";
					return;
				}

				if(event.key == "ArrowRight" && event.target.tagName.toLowerCase() == "input" && !this.colorantLookupOpen) {
					let next = this.findElementAfter(event.target, (x) => 
						x.dataset.rid == event.target.dataset.rid && x.readOnly == false
					)
					next ? next.focus() : "";
					return;
				}

				if(event.key == "ArrowLeft" && event.target.tagName.toLowerCase() == "input" && !this.colorantLookupOpen) {
					let before = this.findElementBefore(event.target, (x) => 
						x.dataset.rid == event.target.dataset.rid && x.readOnly == false
					);
					before ? before.focus() : "";
					return;
				}

				if(event.key == "Enter" && !this.colorantLookupOpen) { // Make enter button act like tab to move to next input
					event.preventDefault();
					let all = Array.from(document.querySelectorAll(`input[data-cid="${event.target.dataset.cid}"]`));
					let last = all[all.length - 1];
					let colorant = document.querySelector(`input[data-rid="${last.dataset.rid}"]:first-of-type`);
					if(all.indexOf(event.target) == all.length - 1 && this.isColorant(colorant)) {



						let row = document.createElement("div");

						row.className = "row";
						let columns = this.createRow(last.dataset.cid);

						for(let column of columns) {
							row.appendChild(column);
						}

						document.getElementById(last.dataset.cid).appendChild(row)

						this.bindInputs(true); // Refresh!

						// LMFAO probably the dumbest fucking code ever
						row.firstElementChild.firstElementChild.focus();
					} else {
						this.find(1, elements, event.target).focus();
					}

					return;
				}

				if(event.key == "Backspace") { // Make backspace button act like shift+tab to move to previous input
					if(event.target.value.length == 0) {
						event.preventDefault();
						this.find(-1, elements, event.target).focus();
					}
					return;
				}

				if(event.key == "Tab") return; // Prevent us from catching a legitimate tab event

				let colorantIDElement = document.getElementById(`c${event.target.dataset.rid}-id`);

				// Check the validity of the colorant id before allowing modification of the other value inputs

				if(!event.ctrlKey && /^.$/u.test(event.key) && colorantIDElement.value.length < 2 && event.target != colorantIDElement) {
					event.preventDefault();
					colorantIDElement.classList.add("error")
					colorantIDElement.focus()
				}
			});

			input.addEventListener("blur", input._blur = event => {
				event.target.classList.remove("error");
				if("colorant" in event.target.dataset) {
					if(!this.isColorant(event.target)) { // If the user attempts to blur a colorant entry input with an invalid id, we retain focus and add an error state
						if(event.target.value.length == 0) {
							let id = event.target.dataset.rid;
							let all = Array.from(document.querySelectorAll(`[data-rid="${id}"]`, true))

							all.forEach(element => {
								element.value = ""
							});

						} else {
							console.error("Invalid colorant");
							event.preventDefault();
							event.target.focus();
							event.target.classList.add("error");
						}
					}
				}
			});
		});

		document.addEventListener("mousedown", document._mousedown = (event) => {
			if(event.button == 0 && event.ctrlKey) {
				alert("nerd");
			}
		})

		document.addEventListener("keydown", document._keydown = (event) => {
			let lookup = document.activeElement.classList.contains("cid");
			let elements = Array.from(document.querySelectorAll("#colorants > div.row"));

			if(event.key == "~" && event.shiftKey && event.target.tagName.toLowerCase() == "input") {
				event.preventDefault();
				let before = this.findElementBefore(event.target, x => x.classList.contains("color"));
				before.querySelector("input:first-of-type").focus();
			}

			if(event.key == "`" && event.target.tagName.toLowerCase() == "input") {
				event.preventDefault();
				let after = this.findElementAfter(event.target, x => x.classList.contains("color"));
				after.querySelector("input:first-of-type").focus();
			}

			if(event.key == "F3" && lookup && !this.colorantLookupOpen) {
				config.lookup.style.display = "block";
				event.preventDefault();
				this.colorantLookupOpen = true;
				this.colorantLookupElement = event.target;
			} else if(event.key == "F3") event.preventDefault(); // Prevent other F3 action

			if(event.key == "F12" || event.key == "F22") {
				event.preventDefault();
				this.calculate();
			}

			if(event.key == "ArrowDown" && this.colorantLookupOpen) {

				let selected = this.colorantLookupSelected;
				event.preventDefault();
				selected++;

				if(selected >= elements.length) {
					selected = 0;
				}

				elements.forEach((e) => {e.classList.remove("selected")});
				elements[selected].classList.add("selected");
				this.colorantLookupSelected = selected;
			}

			if(event.key == "ArrowUp" && this.colorantLookupOpen) {
				let selected = this.colorantLookupSelected;
				event.preventDefault();
				selected--;

				if(selected < 0) {
					selected = elements.length - 1;
				}

				elements.forEach((e) => {e.classList.remove("selected")});
				elements[selected].classList.add("selected");
				this.colorantLookupSelected = selected;
			}

			if(event.key == "Enter" && this.colorantLookupOpen) {
				event.preventDefault();

				let id = elements[this.colorantLookupSelected].querySelector("div:first-of-type").innerText;

				this.colorantLookupElement.value = id;

				this.isColorant(this.colorantLookupElement);

				this.findElementAfter(this.colorantLookupElement, (x) => 
					x.classList.contains("coz")
				).focus();

				config.lookup.style.display = "none";

				elements.forEach((e) => {e.classList.remove("selected")});
				elements[0].classList.add("selected");

				this.colorantLookupSelected = 0;
				this.colorantLookupOpen = false;
				//document.activeElement.value = 
			}

			if(event.key == "Escape" && this.colorantLookupOpen) {
				event.preventDefault();

				config.lookup.style.display = "none";

				elements.forEach((e) => {e.classList.remove("selected")});
				elements[0].classList.add("selected");

				this.colorantLookupSelected = 0;
				this.colorantLookupOpen = false;
			}

			if(event.key == "Escape" && this.resultsDisplayOpen) {
				event.preventDefault();
				this.resultsDisplayOpen = false;
				document.getElementById("results").style.display = "none";
			}

		});
}
}


let calc = new Calculator(); 
calc.start({
	elements: {
		original: document.getElementById("table1"),
		new: document.getElementById("table2"),
		final: false,
		calculate: document.getElementById("calculate"),
	}
});
