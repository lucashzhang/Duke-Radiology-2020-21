// import * as dicomParser from 'dicom-parser';
import * as daikon from 'daikon';
import { TAG_DICT } from './dicomDict';

// These objects are all wrappers for daikon image/series objects, they supply the necessary functions to manipulate the data

export class DCM {
    constructor(filename, buffer) {
        try {
            this.imageData = daikon.Series.parseImage(new DataView(this.toArrayBuffer(buffer)));
            this.filename = filename;
        }
        catch (err) {
            console.log(err);
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

export class CTSeries {

    constructor(ctArray) {
        this.series = this.buildSeries(ctArray);
        this.width = this.series.images[0].getCols();
        this.height = this.series.images[0].getRows();
        this.depth = this.series.images.length;
        this.imageArray = this.buildImageArray()
    }

    buildImageArray() {
        let res = [];
        for (let i = 0; i < this.depth; i++) {
            res.push(this.getSlice(i))
        }
        return res;
    }

    buildSeries(images) {
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

    get axialImages() {
        return this.series.images;
    }

    getSlice(sliceNum) {
        let image = this.axialImages[sliceNum];
        let ctImg = image.getInterpretedData(false, true);
        return new Uint8ClampedArray(ctImg.data);
    }

    getAxialSlice(sliceNum) {
        return this.imageArray[sliceNum]
    }

    getCoronalSlice(sliceNum) {
        let temp = [];

        for (let i = 0; i < this.depth; i++) {
            for (let j = 0; j < this.width; j++) {
                temp.push(this.imageArray[i][sliceNum * this.width + j])
            }
        }
        return new Uint8ClampedArray(temp);
    }

    getSagittalSlice(sliceNum) {
        let temp = [];

        for (let i = 0; i < this.height - 1; i++) {
            for (let j = 0; j < this.depth; j++) {
                temp.push(this.imageArray[j][sliceNum + this.width * i]);
            }
        }

        return new Uint8ClampedArray(temp);
    }
}