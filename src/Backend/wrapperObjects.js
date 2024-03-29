export class Factory {

    static createWrapper(obj, type) {
        // Wraps objects in specified wrapper
        switch (type.toUpperCase()) {
            case 'SERIESWRAPPER':
            case 'SERIES':
                return new SeriesWrapper(obj);
            case 'RSWRAPPER':
            case 'RS':
                return new RSWrapper(obj);
            case 'RDWRAPPER':
            case 'RD':
                return new RDWrapper(obj);
            default:
                return obj;
        }
    }
}

class Wrapper {
    constructor(obj) {
        Object.assign(this, obj);
    }
}
// Casts the Series object to add some useful methods
export class SeriesWrapper extends Wrapper {

    getAxialSlice(sliceNum) {
        sliceNum = Math.floor(sliceNum);
        if (sliceNum > this.depth || sliceNum < 0 || this.imageArray[sliceNum] == null) return null;
        let imageData = new ImageData(this.width, this.height);
        let data = imageData.data;
        for (let i = 3, k = 0; i < data.byteLength; i += 4, k++) {
            data[i - 3] = data[i - 2] = data[i - 1] = this.imageArray[sliceNum][k];
            data[i] = 255;
        }
        return imageData;
    }

    getCoronalSlice(sliceNum) {
        sliceNum = Math.floor(sliceNum);
        if (sliceNum > this.height || sliceNum < 0) return null;
        let k = 3;
        let imageData = new ImageData(this.width, this.depth);
        let data = imageData.data;
        for (let i = 0; i < this.depth; i++) {
            for (let j = 0; j < this.width; j++) {
                let pixelVal = this.imageArray[i][sliceNum * this.width + j];
                data[k - 3] = data[k - 2] = data[k - 1] = pixelVal;
                data[k] = 255;
                k += 4;
            }
        }
        return imageData;
    }

    getSagittalSlice(sliceNum) {
        sliceNum = Math.floor(sliceNum);
        if (sliceNum > this.width || sliceNum < 0) return null;
        let k = 3;
        let imageData = new ImageData(this.height, this.depth);
        let data = imageData.data;
        for (let j = 0; j < this.depth; j++) {
            for (let i = 0; i < this.height; i++) {
                let pixelVal = this.imageArray[j][sliceNum + this.width * i];
                data[k - 3] = data[k - 2] = data[k - 1] = pixelVal;
                data[k] = 255;
                k += 4
            }
        }
        return imageData;

    }
}

export class RDWrapper extends Wrapper {

    getAxialSlice(sliceNum, colorFilter = () => [0, 0, 0, 0], alpha = 128) {
        sliceNum = Math.floor(sliceNum) + Math.round(this.offsetVector[2]);
        if (sliceNum > this.trueDepth || sliceNum < 0 || this.imageArray[sliceNum] == null) return null;
        let imageData = new ImageData(this.trueWidth, this.trueHeight);
        let data = imageData.data;
        // console.log(this.imageArray[sliceNum])
        for (let i = 3, k = 0; i < data.byteLength; i += 4, k++) {
            let pixelVal = this.imageArray[sliceNum][k] * this.doseGridScaling;
            const color = colorFilter(pixelVal) || [0, 0, 0, 0];
            data[i - 3] = color[0];
            data[i - 2] = color[1];
            data[i - 1] = color[2];
            data[i] = color[3] * alpha;
        }
        return imageData;
    }

    getCoronalSlice(sliceNum, colorFilter = () => [0, 0, 0, 0], alpha = 128) {
        sliceNum = Math.floor((sliceNum + this.offsetVector[1]) / this.scaleH);
        if (sliceNum > this.trueHeight || sliceNum < 0) return null;
        let k = 3;
        let imageData = new ImageData(this.trueWidth, this.trueDepth);
        let data = imageData.data;
        for (let i = 0; i < this.trueDepth; i++) {
            for (let j = 0; j < this.trueWidth; j++) {
                let pixelVal = this.imageArray[i][sliceNum * this.trueWidth + j] * this.doseGridScaling;
                const color = colorFilter(pixelVal) || [0, 0, 0, 0];
                data[k - 3] = color[0];
                data[k - 2] = color[1];
                data[k - 1] = color[2];
                data[k] = color[3] * alpha;
                k += 4;
            }
        }
        return imageData;
    }

    getSagittalSlice(sliceNum, colorFilter = () => [0, 0, 0, 0], alpha = 128) {
        sliceNum = Math.floor((sliceNum + this.offsetVector[0]) / this.scaleW);
        if (sliceNum > this.trueWidth || sliceNum < 0) return null;
        let k = 3;
        let imageData = new ImageData(this.trueHeight, this.trueDepth);
        let data = imageData.data;
        for (let j = 0; j < this.trueDepth; j++) {
            for (let i = 0; i < this.trueHeight; i++) {
                let pixelVal = this.imageArray[j][sliceNum + this.trueWidth * i] * this.doseGridScaling
                const color = colorFilter(pixelVal) || [0, 0, 0, 0];
                data[k - 3] = color[0];
                data[k - 2] = color[1];
                data[k - 1] = color[2];
                data[k] = color[3] * alpha;
                k += 4;
            }
        }
        return imageData;
    }
}

export class RSWrapper extends Wrapper {

    getSpecificContours(contourArray) {
        let newObj = {};
        for (let cont of contourArray) {
            newObj[cont] = {};
            Object.assign(newObj[cont], this.contourData[cont])
            // newObj[cont] = this.contourData[cont]
        }
        return newObj;
    }

    getContourAtX(contourObj, x) {

    }

    getContourAtY(contourObj, y) {

    }

    getContourAtZ(contourObj, z) {
        // z = Math.floor(z / this.imageThickness) * this.imageThickness;
        for (let roi in contourObj) {
            if (contourObj[roi].sequences.length > 0) {
                contourObj[roi].sequences = contourObj[roi].sequences.filter(item => item.zIndex === z)
            }
        }
        return contourObj;
    }
}