// import daikon from 'daikon';
import { Factory } from './wrapperObjects';
// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from 'workerize-loader!./file.worker.js'
const fs = window.require('fs'); // Load the File System to execute our common tasks (CRUD);
const { dialog } = window.require('electron').remote;

const rsWorker = new Worker();
const ctWorker = new Worker();
const seriesWorker = new Worker();

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
    let rawRS = await getFiles(absDir, 'RS');
    if (rawRS.length <= 0) {
        alert("Please make sure to include an RS File directory");
        return {};
    }
    let builtRS = await rsWorker.buildRS(rawRS);
    let wrappedRS = Factory.createWrapper(builtRS[0], 'RS');
    return wrappedRS;
}

export async function readCT(absDir) {
    let rawCT = await getFiles(absDir, 'CT');
    let builtCT = await ctWorker.buildCT(rawCT);
    return builtCT;
}

export async function readSeries(absDir) {

    let ctImages = await readCT(absDir);
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