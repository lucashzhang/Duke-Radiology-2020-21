// import daikon from 'daikon';
import { Factory } from './wrapperObjects';
// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from 'workerize-loader!./file.worker.js'
const fs = window.require('fs'); // Load the File System to execute our common tasks (CRUD);
const { dialog } = window.require('electron').remote;

async function getFiles(absDir, fileType) {
    if (!absDir.endsWith('/')) absDir += '/';
    let filePromises = [];
    fs.readdirSync(absDir).forEach(file => {
        const { type, extension } = parseFileName(file);
        if (fileType === type && extension === 'dcm') {
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

export async function readRS(absDir) {
    const rsWorker = new Worker();
    let ctImages = await readCT(absDir, rsWorker);
    if (ctImages.length <= 0) {
        alert("Please make sure to include CT Images in the directory");
        return {};
    }
    let firstCT = ctImages[0];
    let rawRS = await getFiles(absDir, 'RS');
    if (rawRS.length <= 0) {
        alert("Please make sure to include an RS File directory");
        return {};
    }
    let builtRS = await rsWorker.buildRS(rawRS, firstCT);
    let wrappedRS = Factory.createWrapper(builtRS[0], 'RS');
    rsWorker.terminate();
    return wrappedRS;
}

export async function readCT(absDir, ctWorker) {
    let ownWorker = false;
    if (ctWorker == null) {
        ctWorker = new Worker();
        ownWorker = true;
    }

    let rawCT = await getFiles(absDir, 'CT');
    let builtCT = await ctWorker.buildCT(rawCT);

    if (ownWorker) ctWorker.terminate();
    return builtCT;
}

export async function readSeries(absDir) {

    const seriesWorker = new Worker();
    let ctImages = await readCT(absDir, seriesWorker);
    if (ctImages.length <= 0) {
        alert("Please make sure to include CT Images in the directory");
        return {};
    }
    let builtSeries = await seriesWorker.buildSeries(ctImages);
    let wrappedSeries = Factory.createWrapper(builtSeries, 'SERIES');
    if (!wrappedSeries.isSeries()) {
        alert("Please check that your CT images are all from the same series");
        return {};
    };
    seriesWorker.terminate();
    return wrappedSeries;
}

function parseFileName(filename) {
    let parts = filename.split('.');

    return { type: parts[0], extension: parts[parts.length - 1] }
}

export async function pickDirectoryPath() {
    let path = await dialog.showOpenDialog({
        properties: ['openDirectory']
    });
    return path;
}