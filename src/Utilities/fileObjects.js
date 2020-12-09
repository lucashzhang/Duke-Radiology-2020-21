import * as dicomParser from 'dicom-parser';
import * as daikon from 'daikon';
import { TAG_DICT } from './dicomDict';

export class DCM {
    constructor(buffer) {
        try {
            this.dataSet = dicomParser.parseDicom(buffer);
        }
        catch (err) {
            console.log(err)
        }
    }

    convertFromID(id) {
        let asString = String(id);
        let key = `(${asString.substring(0, 4)},${asString.substring(4, asString.length)})`;
        return TAG_DICT[key];
    }
    
    convertToID(id) {
        return `x${id}`;
    }
}

export class RS extends DCM {
    
    get structList() {
        let structs = [];
        let observations = this.dataSet.elements[this.convertToID('30060080')];
        for (let item of observations.items) {
            let itemData = item.dataSet;
            structs.push({
                name: String(itemData.string("x30060085")),
                roi: parseInt(itemData.string("x30060084"))
            });
        }
    
        return structs;
    }
}

export class CT {

    constructor(buffer) {
        try {
            this.imageData = daikon.Series.parseImage(new DataView(this.toArrayBuffer(buffer)));
        }
        catch (err) {
            console.log(err)
        }
    }

    toArrayBuffer(b) {
        return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
    }

    get pixelData() {
        if (this.imageData.hasPixelData()) {
            return this.imageData.getPixelData();
        }
    }

    get rows() {
        if (this.imageData.hasPixelData()) {
            return this.imageData.getRows();
        }
    }

    get columns() {
        if (this.imageData.hasPixelData()) {
            return this.imageData.getCols();
        }
    }

    // get pixelData() {
    //     let pixelDataElement = this.dataSet.elements[this.convertToID('7fe00010')];
    //     return new Uint8ClampedArray(this.dataSet.byteArray.buffer, pixelDataElement.dataOffset, pixelDataElement.length);
    // }

    // get rows() {
    //     let data = new Uint16Array(this.dataSet.byteArray.buffer, this.dataSet.elements["x00280010"].dataOffset, this.dataSet.elements["x00280010"].length);
    //     return data[0];
    // }

    // get columns() {
    //     let data = new Uint16Array(this.dataSet.byteArray.buffer, this.dataSet.elements["x00280011"].dataOffset, this.dataSet.elements["x00280011"].length);
    //     return data[0];
    // }
}