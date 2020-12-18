import * as dicomParser from 'dicom-parser';
import * as daikon from 'daikon';
import { TAG_DICT } from './dicomDict';
// import greenlet from 'greenlet';

class DCM {
    constructor(filename, buffer) {
        try {
            // this.dataSet = dicomParser.parseDicom(buffer);
            function toArrayBuffer(b) {
                return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
            }

            this.imageData = daikon.Series.parseImage(new DataView(toArrayBuffer(buffer)));
            this.filename = filename;
            this.dataSet = dicomParser.parseDicom(buffer);
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

    constructor(filename, buffer) {
        super(filename, buffer);
        let temp = {}
        // let roiContourSequence = this.dataSet.elements["x30060039"].items;
        // for (let roiSeq of roiContourSequence) {
        //     let roi = Number(roiSeq.dataSet.string("x30060084"));
        //     let contourSequence = roiSeq.dataSet.elements["x30060040"];
        //     // for (let contSeq of contourSequence) {

        //     // }

        //     temp[roi] = {
        //         displayColor: roiSeq.dataSet.string("x3006002a")
        //     }
        // }
        // console.log(this.dataSet.elements["x30060039"].items[5].dataSet.elements["x30060040"])
        // console.log(temp)
        let roiContourSequence = this.imageData.tags["30060039"].value
        for (let roiSeq of roiContourSequence) {
            let roi = Number(roiSeq.value.find(obj => obj.id === "30060084").value[0]);
            let displayColor = roiSeq.value.find(obj => obj.id === "3006002A").value;
            let tempSeq = [];
            let contourSequence = roiSeq.value.find(obj => obj.id === "30060040")
            if (contourSequence) {
                for (let contSeq of contourSequence.value) {
                    let seqObj = {
                        numberPoints: contSeq.value.find(obj => obj.id === "30060046").value[0],
                        contours: contSeq.value.find(obj => obj.id === "30060050").value
                    };
                    tempSeq.push(seqObj)
                }
            }
            temp[roi] = {
                displayColor: displayColor,
                sequences: tempSeq
            }
        }
        this.contourData = temp;
    }

    get structList() {
        let structs = [];
        let observations = this.imageData.tags['30060080'].value;
        for (let obs of observations) {
            let dataVals = obs.value;
            structs.push({
                name: String(dataVals.find(obj => obj.id === "30060085").value[0]),
                roi: Number(dataVals.find(obj => obj.id === "30060084").value[0]),
            })
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