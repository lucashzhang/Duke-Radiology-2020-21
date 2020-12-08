import { RS } from './fileObjects';

// const { dialog } = window.require('electron').remote;
const fs = window.require('fs'); // Load the File System to execute our common tasks (CRUD)

export async function readDir(searchType = null) {

    // Temporary directory, will dynamically change afterwards
    let absDir = '/home/lucashzhang/Personal-Projects/duke-radiology/Patient-DICOM/01';

    if (!absDir.endsWith('/')) absDir += '/';

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
    let output = []
    for (let file of dirResults) {
        const { type } = parseFileName(file.filename);
        switch (type) {
            case 'RS':
                output.push(new RS(file.contents))
                break;
            case 'CT':
                break;
            default:
                break;
        }
    }
    console.log(output)
    return output;
}

function parseFileName(filename) {
    let parts = filename.split('.');

    return { type: parts[0], extension: parts[parts.length - 1] }
}