import * as dicomParser from 'dicom-parser';
import * as daikon from 'daikon';
import { TAG_DICT } from './dicomDict';

export class DCM {
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
        // let observations = this.dataSet.elements[this.convertToID('30060080')];
        // for (let item of observations.items) {
        //     let itemData = item.dataSet;
        //     structs.push({
        //         name: String(itemData.string("x30060085")),
        //         roi: parseInt(itemData.string("x30060084"))
        //     });
        // }
        let observations = this.imageData.tags['30060080'].value;
        for (let obs of observations) {
            let dataVals = obs.value;
            structs.push({
                name: String(dataVals.find(obj => obj.id === "30060085").value[0]),
                roi: parseInt(dataVals.find(obj => obj.id === "30060084").value[0]),
            })
        }
    
        return structs;
    }
}

export class CT extends DCM {

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
}