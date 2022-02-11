import fs from "fs";
import path from "path";
import copy from "copyfiles";
import dayjs from "dayjs";
import birthDate from "file-birth";
import { stringify } from "json2yaml";
import parseMD from "parse-md";
import sharp from 'sharp';

import paths from "./src/paths.js";
import getDir from "./src/helpers/getDir.js";
import getImages from "./src/helpers/getImages.js";
import pathToMap from "./src/helpers/pathToMap.js";
import createMeta from "./src/helpers/createMeta.js";
import optiImages from "./src/helpers/optiImages.js"
import createLqip from "./src/helpers/createLqip.js"

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
		const dirImagesOut = path.join(paths.export.images, page.nameDirOut);
		const pathImages = path.join(paths.content.images, page.nameDirOut);
		const dirPage = path.join(paths.export.pages, section.nameDirOut, `${page.nameDirOut}.md`);
		const contentPage = fs.readFileSync(path.join(page.path, "page.md"), "utf8");
		const { metadata, content } = parseMD(contentPage);
		const poster = metadata?.media_order?.split(',')[0] || imagesPage[0] || false;
		const optionsMeta = () => {
			let mdata = {};

			if(poster) {
				mdata.img = poster;
				mdata.lqip = "LQIPPER";
			}

			if(paths.content.favorites.includes(page.nameDirOut)) {
				mdata.favorites = true;
			}

			return mdata;
		}
		const metaOut = createMeta(metadata, optionsMeta());
		const contentOut = content
			.replace(/(##)([\wА-Яа-я])/g, (whole, a, b) => a + " " + b)// фикс заголовков
			.replace(/(!\[.*?\]\()(.+?)(\))/g, (whole, a, b, c) => a + `/${pathImages}/` + b.split('?classes')[0] + c); // фикс путей изображений
		// TODO Незабыть сделать grep для фикса картинок с assets/img/.../http...

		if(imagesPage[0]) {
			fs.mkdirSync(dirImagesOut, { recursive: true });
			optiImages(path.join(page.path, "**/*.{jpg,JPG,jpeg,JPEG,png,svg,gif}"), dirImagesOut);

			if(metaOut?.data?.img) {
				fs.mkdirSync(path.join(dirImagesOut, "poster"), { recursive: true });

				sharp(path.join(page.path, metaOut.data.img))
					.resize(512)
					.toFile(path.join(dirImagesOut, "poster", "512-"+metaOut.data.img), (err, info) => err && console.log(err));
				sharp(path.join(page.path, metaOut.data.img))
					.resize(1920)
					.toFile(path.join(dirImagesOut, "poster", "1920-"+metaOut.data.img), (err, info) => err && console.log(err));
			}
		}

		const pageOut = metaOut.out + contentOut;

		fs.writeFileSync(dirPage, pageOut); // Сохраняем страницу
		poster && createLqip(path.join(page.path, poster), dirPage); // Создаем lqip

		// console.log(dirPage);

			// console.log(section.nameDirOut, page.nameDirOut, imagesPage);
	})
})
