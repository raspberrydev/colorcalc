function createColorTable(id) {
	let header = [ // class, text
		["colorant", "Colorant"],
		["oz", "OZ"],
		["f32", "32"],
		["f64", "64"],
		["f128", "128"],
	];

	let inputs = [
		"colorant",
		"oz",
		"32",
		"64",
		"128"
	];

	let colors = 5;

	let element = document.getElementById(id);
	let table = document.createElement("table");
	table.classList.add("color");

	let head = document.createElement("tr");
	table.appendChild(head);

	for(let item of header) {
		let th = document.createElement("th");
		head.appendChild(th);

		th.classList.add(item[0]);
		th.innerHTML = item[1];
	}

	for(let i = 0; i < colors; i++) { // 5 colorant rows
		let row = document.createElement("tr");
		table.appendChild(row);
		for(let item of inputs) {
			let column = document.createElement("td");
			row.appendChild(column);

			if(item == "colorant") {
				column.innerHTML = `
					<input type="text" class="cid" id="c${i}-id" max-length="2" value=""  pattern="[aA][0-9]{2}" maxlength="2">
					<input type="text" class="cfn" id="c${i}-fn" value="" readonly tabindex="-1">
				`;
			} else {
				column.innerHTML = `
					<input type="text" class="c${item}" id="c${i}-${item}" pattern="\d*" maxlength="${item.length}">
				`;
			}
		}
	}

	element.appendChild(table);
	
}

createColorTable("original-color");