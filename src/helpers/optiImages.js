import compress_images from "compress-images";

export default function optiImages(inDir, outDir) {
	return compress_images(inDir, outDir+"/", { compress_force: false, statistic: true, autoupdate: true }, false,
		{ jpg: { engine: "jpegtran", command: ["-trim", "-progressive", "-copy", "none", "-optimize"], }, },
		{ png: { engine: "pngquant", command: ["--quality=20-50", "-o"] } },
		{ svg: { engine: "svgo", command: "--multipass" } },
		{ gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] } },
		function (error, completed, statistic) {
			console.log("-------------");
			console.log("error: ", error);
			console.log("completed: ", completed);
			console.log("statistic: ", statistic);
			console.log("-------------");
		}
	);
}
