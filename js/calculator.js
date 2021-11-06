// https://stackoverflow.com/questions/69861899/subtract-two-quantities-and-split-into-fractional-values

let colorants = {
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
};

let maxLoads = {
	"oz": 50,
	"32": 64,
	"64": 128,
	"128": 256
};

let focusableElements = [];

let generateFocusableElements = () => {
	focusableElements = Array.from(document.querySelectorAll(
		`a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])`
	)).filter(el => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden"));
	focusableElements.shift(); // Remove first (span)
	focusableElements.pop(); // Remove last (span)
};

let isColorant = (element) => {
	let id = element.value;
	if(/^([a-zA-Z]{1}[0-9]{1})$/.test(id) && colorants.hasOwnProperty(id.toUpperCase())) {
		let elements = Array.from(document.getElementsByTagName("input"));
		elements[elements.indexOf(element) + 1].value = colorants[id.toUpperCase()]
		element.value = id.toUpperCase();
		return true;
	} else {
		return false;
	}
};

let chunkSplit = (arr, bulkSize = 20) => {
    let bulks = [];
    for (let i = 0; i < Math.ceil(arr.length / bulkSize); i++) {
        bulks.push(arr.slice(i * bulkSize, (i + 1) * bulkSize));
    }
    return bulks;
};


let findNext = (array, item) => {
	let items = array.filter(element => !element.readOnly);
	let index = items.indexOf(item);
	return (index + 1) == items.length ? 
		item : items[index + 1];
	// Return itself if last item.
};

let findPrevious = (array, item) => {
	let items = array.filter(element => !element.readOnly);
	let index = items.indexOf(item);
	return index == 0 ? 
		item : items[index - 1];
	// Return itself if first item.
};

let isValidColorant = (text) => /^([a-zA-Z]{1}[0-9]{1})$/.test(text);

let _ = (query, all = false) => all ? document.querySelectorAll(query) : document.querySelector(`#${query}`);

let forcedFocus = false;

_("tab-retainer").addEventListener("focus", () => {
	focusableElements[0].focus();
});

_("tab-anchor").addEventListener("focus", () => {
	focusableElements[focusableElements.length - 1].focus();
});

let createInput = (id, size) => {
	let div = document.createElement("div");

	if(!(size == "colorant")) {
		let input = document.createElement("input");

		Object.assign(input, {
			type: "text",
			className: `c${size}`,
			id: `c${id}-${size}`,
			pattern: "\\d*",
			maxLength: size.length
		});

		let dataset = {
			numeric: "",
			amount: "",
			size, id
		};

		for(let point in dataset) {
			input.setAttribute(`data-${point}`, dataset[point])
		}

		div.appendChild(input);
	} else {
		let input = document.createElement("input");
		let value = document.createElement("input");

		div.setAttribute("class", size);

		Object.assign(input, {
			type: "text",
			className: `cid ${size}`,
			id: `c${id}-id`,
			pattern: "[aA][0-9]{2}",
			maxLength: 2,
			spellcheck: false
		});

		Object.assign(value, {
			type: "text",
			className: `cfn`,
			id: `c${id}-fn`,
			readOnly: true,
			tabIndex: "-1"
		});

		let datasetA = {
			colorant: "", id
		};

		let datasetB = {id};

		for(let point in datasetA) {
			input.setAttribute(`data-${point}`, datasetA[point])
		}

		for(let point in datasetB) {
			value.setAttribute(`data-${point}`, datasetB[point])
		}

		div.appendChild(input);
		div.appendChild(value);
	}
	return div;
};

let createRow = (id) => {
	let columnsTypes = ["colorant", "oz", "32", "64", "128"];
	let columns = [];
	for(let type of columnsTypes) {
		columns.push(createInput(id, type));
	}
	return columns;
};

let createHeader = () => {
	let div = document.createElement("div");
	div.className = "header";

	let headers = ["colorant", "oz", "32", "64", "128"];
	let titles = ["Colorant", "OZ", "32", "64", "128"];

	for(let header of headers) {
		let element = document.createElement("div");
		element.className = parseInt(header) ? "_" + header : header;
		element.innerHTML = titles[headers.indexOf(header)];
		div.appendChild(element);
	}

	return div;
};

let createColorantTable = (startID) => {
	let table = document.createElement("div");
	table.className = "color";

	let id = startID + 1;
	let rowCount = 5;

	let header = createHeader();
	table.appendChild(header);
	
	for(let i = 0; i < rowCount; i++) {
		let row = document.createElement("div");
		row.className = "row";
		let columns = createRow(`${id + i}`);

		for(let column of columns) {
			row.appendChild(column);
		}

		table.appendChild(row);
	}

	return table;
}

let decodeColorantTable = (element) => {
	let table = chunkSplit(Array.from(element.querySelectorAll("input")), 6);

	for(let row of table) row.splice(1, 1);

	return table.map(row => row.map(item => item.value).filter((x) => x)).filter((x) => x.length > 0)
};



document.getElementById("table1").appendChild(createColorantTable(0));
document.getElementById("table2").appendChild(createColorantTable(5));


generateFocusableElements();

focusableElements[0].focus();

document.body.addEventListener("DOMSubtreeModified", () => generateFocusableElements())


Array.from(_("input", true)).forEach(input => {
	input.addEventListener("focus", event => {
		if(!event.target.classList.contains("cfn")) event.target.select()
	});

	input.addEventListener("input", event => {
		if("numeric" in event.target.dataset) {
			event.target.value = event.target.value.replace(/[^0-9]/g, "");
		}
	});

	input.addEventListener("keydown", event => {
		event.target.classList.remove("error");
		let elements = Array.from(_("input", true));

		if(event.key == "Enter") {
			event.preventDefault();
			findNext(elements, event.target).focus();
			return;
		}
		
		if(event.key == "Backspace") {
			if(event.target.value.length == 0) {
				event.preventDefault();
				findPrevious(elements, event.target).focus();
			}
			return;
		}

		if(event.key == "Tab") return;

		let colorantIDElement = document.getElementById(`c${event.target.dataset.id}-id`)

		if(/^.$/u.test(event.key) && colorantIDElement.value.length < 2 && event.target != colorantIDElement) {
			event.preventDefault();
			colorantIDElement.classList.add("error")
			colorantIDElement.focus()
		}
	});

	input.addEventListener("blur", event => {
		event.target.classList.remove("error");
		if("colorant" in event.target.dataset) {
			if(!isColorant(event.target)) {
				if(event.target.value.length == 0) {
					let id = event.target.dataset.id;

					let all = Array.from(_(`[data-id="${id}"]`, true))
					all.forEach(element => {
						element.value = ""
					});

				} else {
					console.log("Invalid colorant");
					event.preventDefault();
					event.target.focus();
					event.target.classList.add("error");
				}
			}
		}

		if("amount" in event.target.dataset) {
			if(parseInt(event.target.value) > maxLoads[event.target.dataset.size]) {
				console.log("Invalid amount");
				event.preventDefault();
				event.target.focus();
				event.target.classList.add("error");
			}
		}
	});
});