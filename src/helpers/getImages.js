import fs from "fs";
import path from "path";

/**
 * Получение списка изображений по указанному пути
 * @param {String} source путь
 * @returns {Array}
 */
export default function getImages(dir) {
	return fs.readdirSync(dir)
		.filter(elem => elem.match(/(jpg|jpeg|png|gif)$/))
		.map(elem => elem);
}
