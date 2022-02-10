import dayjs from "dayjs";
import { stringify } from "json2yaml";

import rexp from "./rexp.js";

export default function createMeta(meta, poster) {
	let metaData = {
		title: meta.title,
		longtitle: meta.gtitle || "",
		description: meta.metadata ? meta.metadata.description : "",
		published: true,
		img: poster
	};

	const tags = rexp(metaData.title, /^\[(.*?)\]/g)[1]?.replace(/\s+/g, "").split("|").join(",") || false;

	if(tags) metaData.tags = tags;

	if(meta.date) {
		const arrDateAndTime = meta.date.split(' ')
		const arrDate = arrDateAndTime[0].split('-');
		const formatedDate = `${arrDate[2]}-${arrDate[1]}-${arrDate[0]} ${arrDateAndTime[1]}`;
		metaData.date = dayjs(formatedDate).format('YYYY-MM-DDTHH:mm');
	}

	if(meta.media_order) {
		metaData.img = meta.media_order.split(',')[0];
	}

	if(metaData.img) {
		// TODO Создать миниатюру постера
	}
	// TODO Создаем lqip или генерируем цвет

	if (meta.metadata && meta.metadata.keywords) {
		metaData.keywords = meta.metadata.keywords;
	}

	const outMetadata = stringify(metaData).replace(/\n  /g, '\n') + "---\n";

	return outMetadata;
}
