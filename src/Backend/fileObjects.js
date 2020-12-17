import * as dicomParser from 'dicom-parser';
import { TAG_DICT } from './dicomDict';
// import greenlet from 'greenlet';

// These objects are all wrappers for daikon image/series objects, they supply the necessary functions to manipulate the data

class DCM {
    constructor(filename, buffer) {
        try {
            this.dataSet = dicomParser.parseDicom(buffer);
            this.filename = filename;
        }
        catch (err) {
            console.log(err);
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