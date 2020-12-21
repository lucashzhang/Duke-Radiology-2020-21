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
        if (sliceNum > this.height) return [];
        return this.imageArray[sliceNum];
    }

    getCoronalSlice(sliceNum) {
        let temp = [];
        if (sliceNum > this.height) return temp;
        for (let i = 0; i < this.depth; i++) {
            for (let j = 0; j < this.width; j++) {
                temp.push(this.imageArray[i][sliceNum * this.height + j])
            }
        }
        return temp;
    }

    getSagittalSlice(sliceNum) {
        let temp = [];
        if (sliceNum > this.width) return temp;
        for (let i = 0; i < this.height - 1; i++) {
            for (let j = 0; j < this.depth; j++) {
                temp.push(this.imageArray[j][sliceNum + this.width * i]);
            }
        }
        return temp;
    }
}

export class RSWrapper extends Wrapper {

    getSpecificContours(contourArray) {
        let newObj = {};
        for (let cont of contourArray) {
            newObj[cont] = this.contourData[cont]
        }
        return newObj;
    }

    getContourAtZ(contourObj, z) {
        for (let roi in contourObj) {
            if (contourObj[roi].sequences.length > 0) {
                contourObj[roi].sequences = contourObj[roi].sequences.filter(item => item.zIndex === z)
            }
        }
        return contourObj;
    }
}