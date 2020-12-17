import * as daikon from 'daikon';

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

// Casts the Series object to add some useful methods
export class SeriesWrapper {
    constructor(series) {
        Object.assign(this, series);
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