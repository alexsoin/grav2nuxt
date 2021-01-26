const fs = require("fs");
const path = require('path');
const copy = require('copyfiles');
const dayjs = require("dayjs");
const birthDate = require('file-birth');
const json2yaml = require('json2yaml').stringify;
const parseMD = require('parse-md').default;

const pathGrav = path.join(__dirname, "grav");
const pathNuxt = {
    img: path.join(__dirname, "nuxt", "assets", "img"),
    content: path.join(__dirname, "nuxt", "content")
};

/**
 * Получение списка директорий по указанному пути
 * @param {String} source путь
 * @returns {Array}
 */
const getDirectories = source => 
    fs.readdirSync(source, {withFileTypes: true})
        .filter(dirent => dirent.isDirectory())
        .map(dirent => path.join(source, dirent.name));
    

const getListImagesInDir = (dir) => fs.readdirSync(dir).filter(elem => elem.match(/(jpg|jpeg|png|gif)$/)).map(elem => elem);

/**
 * Создание списка импорта
 * @param {Array} list массив имен директорий
 * @returns {Array}
 */
const generateList = list => {
    return list.map(item => {
        return {
            name: item.split('.')[1] || item.split('/')[1] || item,
            dir: item,
            outDir: item.split('.')[1] ? item.split('/')[0] + "/" + item.split('.')[1] : item
        }
    })
}

/**
 * Копирование файлов из одной директории в другую
 * @param {String} path путь откуда копировать
 * @param {String} ext расширение
 * @param {String} dir путь куда копировать
 */
const copyrFiles = (path, ext, dir) => {
    copy([path + "**/*." + ext, dir], true, function (err) {
        if (err) console.error(err);
    });
}

/**
 * Изменение контента
 * @param {String} contentMD
 * @param {Object} item
 * @param {String} dateCreate
 * @returns {string}
 */
const editContentMD = (contentMD, item, dateCreate) => {
    const pathImg = `/assets/img/${item.name}/`;
    let {metadata, content} = parseMD(contentMD);
    let datePub = dateCreate;

    if(metadata.publish_date) {
        const arrDateAndTime = metadata.publish_date.split(' ')
        const arrDate = arrDateAndTime[0].split('-');
        const formatedDate = `${arrDate[2]}-${arrDate[1]}-${arrDate[0]} ${arrDateAndTime[1]}`;
        datePub = dayjs(formatedDate).format('YYYY-MM-DDTHH:mm');
    }

    const newMetadata = {
        title: metadata.title,
        longtitle: metadata.gtitle || "",
        description: metadata.metadata ? metadata.metadata.description : "",
        published: true,
        date: datePub,
        img: "/assets/img/img-none.png"
    };

    if (metadata.media_order) {
        newMetadata.img = pathImg + metadata.media_order.split(',')[0];
    } else {
        const pathOldImg = `grav/${item.dir}/`;
        const imgPrimary = getListImagesInDir(pathOldImg)[0];
        newMetadata.img = imgPrimary ? pathImg + imgPrimary : "";
    }

    if (metadata.metadata && metadata.metadata.keywords) {
        newMetadata.keywords = metadata.metadata.keywords;
    }

    const outMetadata = json2yaml(newMetadata).replace(/\n  /g, '\n') + "---\n";

    content = content
        // фикс заголовков
        .replace(/(##)([\wА-Яа-я])/g, (whole, a, b) => a + " " + b)
        // фикс путей изображений
        .replace(/(!\[.*?\]\()(.+?)(\))/g, (whole, a, b, c) => a + pathImg + b.split('?classes')[0] + c);

    return outMetadata + content;
}

const listDirs = getDirectories(pathGrav);
let listArticles = [];

listDirs.forEach(dir => {
    fs.mkdirSync(path.join(pathNuxt.content, dir.replace(pathGrav + "/", '')), { recursive: true })
    listArticles = [
        ...listArticles,
        ...getDirectories(dir)
    ]
});

listArticles = listArticles.map(path => path.replace(pathGrav + "/", ''));
const list = generateList(listArticles);

list.forEach(item => {
    const pathItem = path.join(pathGrav, item.dir);
    const pathImages = path.join(pathNuxt.img, item.name);
    const pathFile = path.join(pathNuxt.content, item.outDir + ".md");

    const contentMdIn = fs.readFileSync(path.join(pathItem, "page.md"), "utf8");
    const contentMdOut = editContentMD(contentMdIn, item, birthDate(pathFile, 'YYYY-MM-DDTHH:mm:ss'));

    copyrFiles(pathItem, "png", pathImages);
    copyrFiles(pathItem, "jpg", pathImages);
    copyrFiles(pathItem, "jpeg", pathImages);
    copyrFiles(pathItem, "gif", pathImages);
    fs.writeFileSync(pathFile, contentMdOut);
    console.log("success:", pathFile.replace(pathNuxt.content + "/", ''));
});
