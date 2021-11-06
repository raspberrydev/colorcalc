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
}

let colorantElements = [];

let selectedColorant = 0;
let selectedColorantElement = null;

let colorantLookup = document.getElementById("colorant-lookup");

let colorantIDInputs = Array.from(document.getElementsByClassName("cid"));

let colorantLookupOpen = false;

for(let colorant in colorants) {
	let row = colorantLookup.insertRow(-1);
	let id = row.insertCell(0);
	let name = row.insertCell(1);
	id.innerHTML = colorant;
	name.innerHTML = colorants[colorant];
	row.id = colorant;
	row.classList.add("picker-colorant");
	if(colorant == "B1") row.classList.add("selected");
	colorantElements.push(row);
}


//let colorants = Array.from(document.getElementsByClassName("picker-colorant"));

Array.from(document.getElementsByTagName("input")).forEach(input => {
	input.addEventListener("focus", event => {
		if(!event.target.classList.contains("cfn")) event.target.select()
	});

	input.addEventListener("keypress", event => {
		
	});
})

document.body.addEventListener("keydown", (event) => {
	let lookup = document.activeElement.classList.contains("cid");

	if(event.key == "F3" && lookup && !colorantLookupOpen) {
		// Open colorant lookup only if focused on colorant id input
		document.getElementById("lookup").style.display = "block";
		event.preventDefault();
		colorantLookupOpen = true;
	} else if(event.key == "F3") {
		event.preventDefault();
	}
	
	if(event.key == "ArrowDown" && lookup && colorantLookupOpen) {
		event.preventDefault();
		selectedColorant++;
		if(selectedColorant >= colorantElements.length) selectedColorant = 0;
		colorantElements.forEach((e) => {e.classList.remove("selected")});
		colorantElements[selectedColorant].classList.add("selected");
		selectedColorantElement = document.getElementsByClassName("selected")[0];
	}
	
	if(event.key == "ArrowUp" && lookup && colorantLookupOpen) {
		event.preventDefault();
		selectedColorant--;
		if(selectedColorant < 0) selectedColorant = colorantElements.length - 1;
		colorantElements.forEach((e) => {e.classList.remove("selected")});
		colorantElements[selectedColorant].classList.add("selected");
		selectedColorantElement = document.getElementsByClassName("selected")[0];
	}

	if(event.key == "Enter" && lookup && colorantLookupOpen) {
		event.preventDefault();
		document.activeElement.value = selectedColorantElement.id;
		document.activeElement.nextElementSibling.value = colorants[selectedColorantElement.id];
		colorantLookupOpen = false;
		document.getElementById("lookup").style.display = "none";
	} else if(event.key == "Enter" && lookup) {
		if(document.activeElement.value.toUpperCase() in colorants) {
			document.activeElement.value = document.activeElement.value.toUpperCase();
			document.activeElement.nextElementSibling.value = colorants[document.activeElement.value.toUpperCase()];
		}
	}
	
	if(event.key == "Escape") {
		// Open colorant lookup only if focused on colorant id input
		document.getElementById("lookup").style.display = "none";
		event.preventDefault();
		colorantLookupOpen = false;
	}
	
})