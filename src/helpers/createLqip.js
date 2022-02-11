import fs from "fs";
import imoen from "imoen";

export default async function createLqip(img, page) {
	const lqip = await imoen.lqip(img);

	try {
		fs.readFile(page, 'utf-8', function (err, data) {
			if (err) throw err;

			const newValue = data.replace(/LQIPPER/gim, lqip);
			fs.writeFile(page, newValue, 'utf-8', function (err, data) {
				if (err) throw err;
			})
		})
	} catch (error) {
		console.log(error);
	}
}
