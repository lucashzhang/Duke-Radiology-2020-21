import daikon from 'daikon';
import sanitizeHtml from 'sanitize-html';
import { Factory } from './wrapperObjects';
// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from 'workerize-loader!./file.worker.js'
const fs = window.require('fs'); // Load the File System to execute our common tasks (CRUD);
const { dialog } = window.require('electron').remote;

async function getFiles(absDir, fileType = "ALL") {
    if (!absDir.endsWith('/')) absDir += '/';
    let filePromises = [];
    fs.readdirSync(absDir).forEach(file => {
        const { type, extension } = parseFileName(file);
        if ((fileType === "ALL" || fileType === type) && extension === 'dcm') {
            try {
                filePromises.push(new Promise((resolve, reject) => {
                    fs.readFile(`${absDir}${file}`, (err, content) => {
                        if (err) return reject(err);
                        return resolve({ filename: file, type: type, contents: content });
                    });
                }));
            } catch (error) {
                console.log(`Could not read file: ${file}, with error: ${error}`);
            }
        }
    });

    let dirResults = await Promise.all(filePromises);
    return dirResults
}

export async function getFile(absDir, filename) {

    let filePromise = new Promise((resolve, reject) => {
        fs.readFile(`${absDir}/${filename}`, (err, content) => {
            if (err) return reject(err);
            return resolve({ filename, contents: content });
        });
    });

    let fileContents = await filePromise;
    return fileContents;
}

export async function getSummary(absDir, filename) {
    if (filename.length === 0 || absDir.length === 0) return '';
    const { contents } = await getFile(absDir, filename);

    function toArrayBuffer(b) {
        return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
    }

    daikon.Parser.verbose = false;
    let imageData = daikon.Series.parseImage(new DataView(toArrayBuffer(contents)));
    // const siemens = new daikon.Siemens(toArrayBuffer(contents));

    let html = imageData.toString()
    // const clean = sanitizeHtml(html, {
    //     allowedTags: [],
    //     allowedAttributes: {}
    // });

    // console.log(clean);
    return html;
}

export async function readRS(absDir, rsWorker = null) {

    let ownWorker = false;
    if (rsWorker == null) {
        rsWorker = new Worker();
        ownWorker = true;
    }

    let ctImages = await readCT(absDir, rsWorker);
    let firstCT = ctImages[0];
    let rawRS = await getFiles(absDir, 'RS');
    if (rawRS.length <= 0) {
        alert("Please make sure to include an RS File directory");
        return {};
    }
    let builtRS = await rsWorker.buildRS(rawRS, firstCT);
    let wrappedRS = Factory.createWrapper(builtRS[0], 'RS');

    if (ownWorker) rsWorker.terminate();
    return wrappedRS;
}

export async function readCT(absDir, ctWorker = null) {
    let ownWorker = false;
    if (ctWorker == null) {
        ctWorker = new Worker();
        ownWorker = true;
    }

    let rawCT = await getFiles(absDir, 'CT');
    let builtCT = await ctWorker.buildCT(rawCT);
    if (builtCT.length <= 0) {
        alert("Please make sure to include CT Images in the directory");
        return {};
    }

    if (ownWorker) ctWorker.terminate();
    return builtCT;
}

export async function readSeries(absDir, seriesWorker = null) {

    let ownWorker = false;
    if (seriesWorker == null) {
        seriesWorker = new Worker();
        ownWorker = true;
    }

    let ctImages = await readCT(absDir, seriesWorker);
    let builtSeries = await seriesWorker.buildSeries(ctImages);
    let wrappedSeries = Factory.createWrapper(builtSeries, 'SERIES');
    if (!wrappedSeries.isSeries()) {
        alert("Please check that your CT images are all from the same series");
        return {};
    }

    if (ownWorker) seriesWorker.terminate();
    return wrappedSeries;
}

export async function scanFiles(absDir, validationWorker = null) {
    let ownWorker = false;
    if (validationWorker == null) {
        validationWorker = new Worker();
        ownWorker = true;
    }

    let res = {}

    let rawCT = await getFiles(absDir, 'CT');
    let seriesInfo = {};
    if (rawCT.length > 0) {
        seriesInfo = await validationWorker.scanSeries(rawCT);
        res.seriesInfo = seriesInfo;
    }

    let rawRS = await getFiles(absDir, 'RS');
    let rsInfo = {};
    if (rawRS.length > 0) {
        rsInfo = await validationWorker.scanRS(rawRS);
        res.rsInfo = rsInfo;
    }

    res.isValid = !!(seriesInfo.isValid && rsInfo.isValid && seriesInfo.studyUID === rsInfo.studyUID);
    console.log(res.isValid)

    if (ownWorker) validationWorker.terminate();
    return res;
}

function parseFileName(filename) {
    let parts = filename.split('.');

    return { type: parts[0], extension: parts[parts.length - 1] }
}

export async function pickDirectoryPath(defaultPath = '') {
    let path = await dialog.showOpenDialog({
        defaultPath: defaultPath,
        properties: ['openDirectory']
    });
    return path;
}