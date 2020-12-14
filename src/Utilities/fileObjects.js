// import * as dicomParser from 'dicom-parser';
import * as daikon from 'daikon';
import * as _ from 'underscore';
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
        return {};
    }

    get rows() {
        if (this.imageData.hasPixelData()) {
            return this.imageData.getRows();
        }
        return 0;
    }

    get columns() {
        if (this.imageData.hasPixelData()) {
            return this.imageData.getCols();
        }
        return 0;
    }
}

export class CTSeries {

    constructor(ctArray) {
        this.series = this.buildSeries(ctArray);
        this.width = this.series.images[0].getCols();
        this.height = this.series.images[0].getRows();
        this.thickness = this.series.images[0].getSliceThickness();
        this.depth = (this.series.images.length - 1) * this.thickness + 1;
        this.imageArray = this.buildDetailedArray();
    }

    buildImageArray() {
        let res = [];
        for (let i = 0; i < this.series.images.length - 1; i++) {
            for (let j = 0; j < this.thickness; j++) {
                res.push(this.getSlice(i));
            }
        }
        res.push(this.getSlice(this.series.images.length - 1));
        return res;
    }

    buildDetailedArray() {

        function weightedAverage(array1, array2, weight, thickness) {
            let res = array1.map((a, i) => {
                let b = array2[i];
                return a * (thickness - weight) / thickness + b * weight / thickness;
            });
            return res;
        }

        let res = [];
        for (let i = 0; i < this.series.images.length - 1; i++) {
            res.push(this.getSlice(i));
            for (let j = 1; j < this.thickness; j++) {
                let slice = weightedAverage(this.getSlice(i), this.getSlice(i + 1), j, this.thickness);
                res.push(slice);
            }
        }
        res.push(this.getSlice(this.series.images.length - 1));
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