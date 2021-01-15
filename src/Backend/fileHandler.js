import daikon from 'daikon';
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
    if (filename.length === 0 || absDir.length === 0) return [];
    const { contents } = await getFile(absDir, filename);

    function toArrayBuffer(b) {
        return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
    }

    daikon.Parser.verbose = false;
    let imageData = daikon.Series.parseImage(new DataView(toArrayBuffer(contents)));

    let sorted_keys = Object.keys(imageData.tags).sort();
    let tagList = [];

    for (let i = 0; i < sorted_keys.length; i++) {
        let key = sorted_keys[i];
        if (imageData.tags.hasOwnProperty(key)) {
            let tag = imageData.tags[key];
            tagList.push(readTagString(tag))
        }
    }

    return tagList;
}

function readTagString(tag, level = 0) {

    function getTagStr(tag) {
        let groupStr = daikon.Utils.dec2hex(tag.group),
            elemStr = daikon.Utils.dec2hex(tag.element),
            tagStr = `(${groupStr},${elemStr})`;
        return tagStr;
    }
    let ctr,
        des = '',
        padding,
        tagStr = getTagStr(tag);

    let valueStr = "";

    padding = "";
    for (ctr = 0; ctr < level; ctr += 1) {
        padding += "  ";
    }

    if (tag.sublist) {
        for (ctr = 0; ctr < tag.value.length; ctr += 1) {
            valueStr += ('\n\n' + (readTagString(tag.value[ctr], level + 1)));
        }
    } else if (tag.vr === 'SQ') {
        valueStr = '';
    } else if (tag.isPixelData()) {
        valueStr = 'The Pixel Data is too big to render here, please view it on the CT Images page';
    } else if (!tag.value) {
        valueStr = '';
    } else if (tag.value.length > 15) {
        valueStr = 'Too Many Values to Display';
    } else if (tag.value.length === 1) {
        valueStr = tag.value[0];
    } else {
        valueStr = '[' + tag.value + ']';
    }

    if (tag.isSublistItem()) {
        tagStr = "Sequence Item";
    } else if (tag.isSublistItemDelim()) {
        tagStr = "Sequence Item Delimiter";
    } else if (tag.isSequenceDelim()) {
        tagStr = "Sequence Delimiter";
    } else if (tag.isPixelData()) {
        tagStr = "Pixel Data";
    } else {
        des = daikon.Utils.convertCamcelCaseToTitleCase(daikon.Dictionary.getDescription(tag.group, tag.element));
    }

    return `${padding} ${tagStr} ${des}: ${valueStr}`;
}

export async function readRS(absDir, rsWorker = null) {

    let ownWorker = false;
    if (rsWorker == null) {
        rsWorker = new Worker();
        ownWorker = true;
    }

    let ctImages = await readCT(absDir, rsWorker, true);
    let firstCT = ctImages[0];
    let rawRS = await getFiles(absDir, 'RS');
    if (rawRS.length <= 0) {
        return {};
    }
    let builtRS = await rsWorker.buildRS(rawRS, firstCT);
    let wrappedRS = Factory.createWrapper(builtRS[0], 'RS');

    if (ownWorker) rsWorker.terminate();
    return wrappedRS;
}

export async function readRD(absDir, rdWorker = null) {

    let ownWorker = false;
    if (rdWorker == null) {
        rdWorker = new Worker();
        ownWorker = true;
    }

    let ctImages = await readCT(absDir, rdWorker, true);
    let firstCT = ctImages[0];
    let rawRD = await getFiles(absDir, 'RD');
    if (rawRD.length <= 0) {
        return {};
    }
    let builtRD = await rdWorker.buildRD(rawRD, firstCT);
    let wrappedRD = Factory.createWrapper(builtRD[0], 'RD');

    if (ownWorker) rdWorker.terminate();
    return wrappedRD;
}

export async function readCT(absDir, ctWorker = null, one = false) {
    let ownWorker = false;
    if (ctWorker == null) {
        ctWorker = new Worker();
        ownWorker = true;
    }

    let rawCT = await getFiles(absDir, 'CT');
    if (one) rawCT = [rawCT[0]];
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

    let raw = await getFiles(absDir, 'CT');
    let seriesInfo = {};
    if (raw.length > 0) {
        seriesInfo = await validationWorker.scanSeries(raw);
        res.seriesInfo = seriesInfo;
    }

    raw = await getFiles(absDir, 'RS');
    let rsInfo = {};
    if (raw.length > 0) {
        rsInfo = await validationWorker.scanRS(raw);
        res.rsInfo = rsInfo;
    }

    raw = await getFiles(absDir, 'RD');
    let rdInfo = {};
    if (raw.length > 0) {
        rdInfo = await validationWorker.scanRD(raw);
        res.rdInfo = rdInfo;
    }

    res.isValid = !!(seriesInfo.isValid
        && rsInfo.isValid
        && seriesInfo.studyUID === rsInfo.studyUID
        && rsInfo.studyUID === rdInfo.studyUID
    );

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