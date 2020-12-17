import * as dicomParser from 'dicom-parser';
import * as daikon from 'daikon';
import { TAG_DICT } from './dicomDict';
// import greenlet from 'greenlet';

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

export class CT {

    constructor(filename, buffer) {

        function toArrayBuffer(b) {
            return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
        }

        this.imageData = daikon.Series.parseImage(new DataView(toArrayBuffer(buffer)));
        this.filename = filename;
        this.interpretedData = new Uint8ClampedArray(this.imageData.getInterpretedData(false, true).data);
        this.thickness = this.imageData.getSliceThickness();
        this.rows = this.imageData.getRows();
        this.cols = this.imageData.getCols();
        this.position = this.imageData.getImagePosition();
    }
}

export class Series {

    constructor(ctArray) {

        function buildInterpolatedArray(images, thickness) {

            function weightedAverage(array1, array2, weight) {
                let res = array1.map((a, i) => {
                    let b = array2[i];
                    return a * (thickness - weight) / thickness + b * weight / thickness;
                });
                return res;
            }

            let res = [];
            for (let i = 0; i < images.length - 1; i++) {
                res.push(images[i].interpretedData);
                for (let j = 1; j < thickness; j++) {
                    let slice = weightedAverage(images[i].interpretedData, images[i + 1].interpretedData, j);
                    res.push(slice);
                }
            }
            res.push(images[images.length - 1].interpretedData);
            return res;
        }

        this.images = ctArray.sort((a, b) => a.position - b.position);
        this.thickness = ctArray[0].thickness;
        this.width = ctArray[0].cols;
        this.height = ctArray[0].rows;
        this.depth = (ctArray.length - 1) * this.thickness + 1;
        this.imageArray = buildInterpolatedArray(this.images, this.thickness);
    }
}