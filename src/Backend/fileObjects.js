// import * as dicomParser from 'dicom-parser';
import * as daikon from 'daikon';
import { TAG_DICT } from './dicomDict';
// import greenlet from 'greenlet';

// These objects are all wrappers for daikon image/series objects, they supply the necessary functions to manipulate the data

class DCM {
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

    constructor(series, width, height, thickness, depth, imageArray) {
        this.series = series;
        this.width = width;
        this.height = height;
        this.thickness = thickness;
        this.depth = depth;
        this.imageArray = imageArray
    }

    static async build(ctArray) {

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

        function interpret(series) {
            return series.images.map(image => new Uint8ClampedArray(image.getInterpretedData(false, true).data))
        }

        function buildInterpolatedArray(interpreted, thickness) {

            function weightedAverage(array1, array2, weight) {
                let res = array1.map((a, i) => {
                    let b = array2[i];
                    return a * (thickness - weight) / thickness + b * weight / thickness;
                });
                return res;
            }

            let res = [];
            for (let i = 0; i < interpreted.length - 1; i++) {
                res.push(interpreted[i]);
                for (let j = 1; j < thickness; j++) {
                    let slice = weightedAverage(interpreted[i], interpreted[i + 1], j);
                    res.push(slice);
                }
            }
            res.push(interpreted[interpreted.length - 1]);
            return res;
        }

        // const interpolate = greenlet(buildInterpolatedArray);

        let series = buildSeries(ctArray);
        let width = series.images[0].getCols();
        let height = series.images[0].getRows();
        let thickness = series.images[0].getSliceThickness();
        let depth = (series.images.length - 1) * thickness + 1;
        let interpreted = interpret(series);
        let imageArray = buildInterpolatedArray(interpreted, thickness);

        return new CTSeries(series, width, height, thickness, depth, imageArray);
    }

    getAxialSlice(sliceNum) {
        return this.imageArray[sliceNum];
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