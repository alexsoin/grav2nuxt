import paths from "../paths.js";
import rexp from "./rexp.js";

/** Из пути создается объект данных */
export default function pathToMap(path, dir) {
	const nameDirIn = path.replace(dir+"/", "")
	return {
		path: path,
		nameDirIn,
		nameDirOut: rexp(nameDirIn, /(\d+\.)(.*?)$/g)[2] || nameDirIn,
	}
}
