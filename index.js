import fs from "fs";
import path from "path";
import copy from "copyfiles";
import dayjs from "dayjs";
import birthDate from "file-birth";
import { stringify } from "json2yaml";
import parseMD from "parse-md";

import paths from "./src/paths.js";
import getDir from "./src/helpers/getDir.js";
import getImages from "./src/helpers/getImages.js";
import pathToMap from "./src/helpers/pathToMap.js";
import createMeta from "./src/helpers/createMeta.js";

// чистим папку вывода
fs.rmSync(paths.export.dir, { recursive: true, force: true });

// список разделов сайта
const sectionsDir = getDir(paths.import.dir)
	.map(i => pathToMap(i, paths.import.dir))
	.filter(i => !paths.import.exclude.includes(i.nameDirOut));


sectionsDir.forEach(section => {
	const pagesDir = getDir(section.path).map(i => pathToMap(i, section.path));

	// создаем папки
	fs.mkdirSync(path.join(paths.export.pages, section.nameDirOut), { recursive: true });

	pagesDir.forEach(page => {
		const imagesPage = getImages(page.path);
		const pathImages = path.join(paths.content.images, page.nameDirOut);
		const dirPage = path.join(paths.export.pages, section.nameDirOut, `${page.nameDirOut}.md`);
		const contentPage = fs.readFileSync(path.join(page.path, "page.md"), "utf8");
		const { metadata, content } = parseMD(contentPage);
		const metaOut = createMeta(metadata, imagesPage[0]);
		const contentOut = content
			.replace(/(##)([\wА-Яа-я])/g, (whole, a, b) => a + " " + b)// фикс заголовков
			.replace(/(!\[.*?\]\()(.+?)(\))/g, (whole, a, b, c) => a + `/${pathImages}/` + b.split('?classes')[0] + c); // фикс путей изображений
		// TODO Незабыть сделать grep для фикса картинок с assets/img/.../http...

		if(imagesPage) {
			// TODO Сохраняем картинки и сжимаем
			// console.log(pathImages);
		}

		const pageOut = metaOut + contentOut;

		fs.writeFileSync(dirPage, pageOut); // Сохраняем страницу

		// console.log(dirPage);

			// console.log(section.nameDirOut, page.nameDirOut, imagesPage);
	})
})
