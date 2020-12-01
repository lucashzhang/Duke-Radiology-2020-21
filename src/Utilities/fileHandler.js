import * as dicomParser from 'dicom-parser';
import * as daikon from 'daikon';
import { TAG_DICT } from './dicomDict';

// const { dialog } = window.require('electron').remote;
// const fs = window.require('fs'); // Load the File System to execute our common tasks (CRUD)

// export function writeFiles() {
//     let content = "Some text to save into the file";

//     // You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
//     dialog.showSaveDialog((fileName) => {
//         if (fileName === undefined) {
//             console.log("You didn't save the file");
//             return;
//         }

//         // fileName is a string that contains the path and filename created in the save file dialog.  
//         fs.writeFile(fileName, content, (err) => {
//             if (err) {
//                 alert("An error ocurred creating the file " + err.message)
//             }

//             alert("The file has been succesfully saved");
//         });
//     });
// }

export function readDICOMS(files) {
    for (let file of files) {
        let parts = file.name.split('.');
        let type = parts[0]
        let extension = parts[parts.length - 1];
        if (extension === "dcm") {
            readDICOM(file, type)
        }
    }
}

export function readDICOM(file, type) {
    // create a Uint8Array or node.js Buffer with the contents of the DICOM P10 byte stream
    // you want to parse (e.g. XMLHttpRequest to a WADO server)

    const reader = new FileReader()

    reader.onabort = () => console.log('file reading was aborted')
    reader.onerror = () => console.log('file reading has failed')
    reader.onload = () => {
        // Do whatever you want with the file contents
        const binaryStr = reader.result
        let byteArray = new Uint8Array(binaryStr);
        try {
            // Parse the byte array to get a DataSet object that has the parsed contents
            var dataSet = dicomParser.parseDicom(byteArray/*, options */);
            // access a string element

            // create a typed array on the pixel data (this example assumes 16 bit unsigned data)

            switch (type) {
                case "RS":
                    readRS(dataSet);
                    break;
                case "RD":
                    // readRD(dataSet);
                    break;
            }
        }
        catch (ex) {
            console.log('Error parsing byte stream', ex);
        }

        // daikon.Parser.verbose = true;
        // let image = daikon.Series.parseImage(new DataView(binaryStr));
        // let siemens = new daikon.Siemens(binaryStr)
    }
    reader.readAsArrayBuffer(file)
}

function convertFromID(id) {
    let asString = String(id);
    let key = `(${asString.substring(0, 4)},${asString.substring(4, asString.length)})`
    return TAG_DICT[key]
}

function convertToID(id) {
    return `x${id}`
}

function findROI(array) {
    let found = array.find(element => element.id === "30060084");
    return found.value[0];
}

function findOBSLabel(array) {
    let found = array.find(element => element.id === "30060085");
    return found.value[0];
}

function readRS(dataSet) {
    let observations = dataSet.elements[convertToID(30060080)];
    for (let item of observations.items) {
        let itemData = item.dataSet;
        console.log(itemData.string('x30060085'), itemData.string("x30060084"))
    }
}