export function convertHMS(pSec) {
	let nbSec = pSec;
	let sortie = {};
	sortie.heure = Math.trunc(nbSec / 3600);
	if (sortie.heure < 10) { sortie.heure = "0" + sortie.heure }

	nbSec = nbSec % 3600;
	sortie.minute = Math.trunc(nbSec / 60);
	if (sortie.minute < 10) { sortie.minute = "0" + sortie.minute }

	nbSec = nbSec % 60;
	sortie.seconde = Math.trunc(nbSec);
	if (sortie.seconde < 10) { sortie.seconde = "0" + sortie.seconde }

	return sortie
}

export const toBase64 = file => new Promise((resolve, reject) => {
	const reader = new FileReader();
	reader.readAsDataURL(file);
	reader.onload = () => resolve(reader.result);
	reader.onerror = error => reject(error);
});

export function srt(text) {
	let table = text.split("\n\n").filter(e => e)
	let return_table = [];

	table.forEach(t => {
		let data = t.split("\n");
		let obj = {};

		obj.id = data[0];
		obj.start_text = data[1].substr(0, 8);

		let hms = obj.start_text.split(":");
		obj.start_seconds = (+hms[0]) * 60 * 60 + (+hms[1]) * 60 + (+hms[2]) + (parseInt(data[1].substr(9, 3)) / 1000);

		obj.end_text = data[1].substr(17, 8)

		hms = obj.end_text.split(":");
		obj.end_seconds = (+hms[0]) * 60 * 60 + (+hms[1]) * 60 + (+hms[2]) + (parseInt(data[1].substr(26, 3)) / 1000);

		obj.text = data[2];
		if (!!data[3]) obj.text = obj.text + " " + data[3];

		return_table.push(obj);
	})

	return return_table;
}