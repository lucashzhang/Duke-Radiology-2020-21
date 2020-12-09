import daikon from 'daikon';
import { RS, CT } from './fileObjects';

// const { dialog } = window.require('electron').remote;
const fs = window.require('fs'); // Load the File System to execute our common tasks (CRUD)

export async function readDir(searchType = null, series = false) {

    // Temporary directory, will dynamically change afterwards
    let absDir = '/home/lucashzhang/Personal-Projects/duke-radiology/Patient-DICOM/01';

    if (!absDir.endsWith('/')) absDir += '/';

    if (series) searchType = 'CT'

    let filePromises = []
    fs.readdirSync(absDir).forEach(file => {
        const { type, extension } = parseFileName(file);
        if ((searchType == null || type === searchType) && extension === 'dcm') {
            try {
                filePromises.push(new Promise((resolve, reject) => {
                    fs.readFile(`${absDir}${file}`, (err, content) => {
                        if (err) return reject(err);
                        return resolve({ filename: file, contents: content })
                    });
                }));
            } catch (error) {
                console.log(`Could not read file: ${file}, with error: ${error}`);
            }
        }
    });

    let dirResults = await Promise.all(filePromises);
    let output = buildObjects(dirResults);

    // Builds a series if specified in the parameters
    if (series && output['CT'] && output['CT'].length > 0) {
        let imageSeries = buildSeries(output['CT']);
        output['SERIES'] = imageSeries;
    }

    return output;
}

function buildObjects(dirResults) {
    let output = {}
    for (let file of dirResults) {
        const { type } = parseFileName(file.filename);
        switch (type) {
            case 'RS':
                if (output.hasOwnProperty('RS')) {
                    output['RS'].push(new RS(file.contents))
                } else {
                    output['RS'] = [new RS(file.contents)]
                }
                break;
            case 'CT':
                if (output.hasOwnProperty('CT')) {
                    output['CT'].push(new CT(file.contents))
                } else {
                    output['CT'] = [new CT(file.contents)]
                }
                break;
            default:
                break;
        }
    }
    return output;
}

function buildSeries(images) {
    let series = new daikon.Series();

    for (let image of images) {
        let data = image.imageData;
        if (series.matchesSeries(data)) {
            series.addImage(data);
        }
        
    }
    series.buildSeries();

    return series
}

function parseFileName(filename) {
    let parts = filename.split('.');

    return { type: parts[0], extension: parts[parts.length - 1] }
}