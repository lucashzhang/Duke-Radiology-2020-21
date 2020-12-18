export class Wrapper {
    constructor(obj) {
        Object.assign(this, obj);
    }

    static factory(obj, type) {
        // Wraps objects in specified wrapper
        switch (type.toUpperCase()) {
            case 'SERIESWRAPPER':
            case 'SERIES':
                return new SeriesWrapper(obj);   
            default:
                return obj;
        }
    }
}
// Casts the Series object to add some useful methods
export class SeriesWrapper extends Wrapper {

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