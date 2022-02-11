import path from "path";
import { URL } from 'url';

const rootDir = new URL('../../', import.meta.url).pathname;
const exportDir = path.join(rootDir, "grav2nuxt", "result");

export default {
	import: {
		dir: path.join(rootDir, "zencod", "pages"),
		exclude: ["home", "about"]
	},
	export: {
		dir: exportDir,
		images: path.join(exportDir, "assets", "img"),
		pages: path.join(exportDir, "content"),
	},
	content: {
		images: path.join("assets", "img"),
		favorites: [ "git-commands", "linux-settings", "linux-wsl-in-windows", "first-step-git", "harden-modx-revo", "bash-cribs", "modx-sozdanie-i-upravlenie-svoimi-mysql-tablicami-cherez-obekty"]
	}
}
