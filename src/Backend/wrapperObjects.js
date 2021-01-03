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
        sliceNum = Math.floor(sliceNum)
        if (sliceNum > this.depth || sliceNum < 0) return [];
        return this.imageArray[sliceNum];
    }

    getCoronalSlice(sliceNum) {
        sliceNum = Math.floor(sliceNum)
        let temp = [];
        if (sliceNum > this.height || sliceNum < 0) return temp;
        for (let i = 0; i < this.depth; i++) {
            for (let j = 0; j < this.width; j++) {
                temp.push(this.imageArray[i][sliceNum * this.height + j])
            }
        }
        return temp;
    }

    getSagittalSlice(sliceNum) {
        sliceNum = Math.floor(sliceNum)
        let temp = [];
        if (sliceNum > this.width || sliceNum < 0) return temp;
        for (let j = 0; j < this.depth; j++) {
            for (let i = 0; i < this.height; i++) {
                temp.push(this.imageArray[j][sliceNum + this.width * i]);
            }
        }
        return temp;
    }

    isSeries() {
        for (let i = 1; i < this.images.length; i++) {
            if (Math.abs(this.images[i].position[2] - this.images[i-1].position[2]) !== this.thickness) {
                return false
            }
        }
        return true;
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