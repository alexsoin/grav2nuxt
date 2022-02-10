import fs from "fs";
import path from "path";

/**
 * Получение списка директорий по указанному пути
 * @param {String} source путь
 * @returns {Array}
 */
export default function getDir(source) {
	return fs.readdirSync(source, {withFileTypes: true})
		.filter(dirent => dirent.isDirectory())
		.map(dirent => path.join(source, dirent.name))
}
