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
            // this.dataSet = dicomParser.parseDicom(buffer);
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

    constructor(filename, buffer, ct) {
        super(filename, buffer);

        const getContour = () => {
            let temp = {}
            let roiContourSequence = this.imageData.tags["30060039"].value
            if (roiContourSequence == null) return null;
            for (let roiSeq of roiContourSequence) {
                let roi = Number(roiSeq.value.find(obj => obj.id === "30060084").value[0]);
                let displayColor = roiSeq.value.find(obj => obj.id === "3006002A").value;
                let tempSeq = [];
                let contourSequence = roiSeq.value.find(obj => obj.id === "30060040")
                if (contourSequence) {
                    for (let contSeq of contourSequence.value) {
                        let rawContours = contSeq.value.find(obj => obj.id === "30060050").value;
                        let tempContours = [];
                        for (let i = 2; i < rawContours.length; i += 3) {
                            tempContours.push([((rawContours[i - 2] - this.patientPosition[0]) / this.pixelSpacing[0]), ((rawContours[i - 1] - this.patientPosition[1]) / this.pixelSpacing[1]), rawContours[i]])
                        }
                        let seqObj = {
                            numberPoints: contSeq.value.find(obj => obj.id === "30060046").value[0],
                            contours: tempContours,
                            zIndex: contSeq.value.find(obj => obj.id === "30060050").value[2]
                        };
                        tempSeq.push(seqObj)
                    }
                    tempSeq = tempSeq.sort((a, b) => a.zIndex - b.zIndex)
                }
                temp[roi] = {
                    displayColor: displayColor != null ? displayColor : [0, 0, 0],
                    sequences: tempSeq
                }
            }
            return temp;
        }

        const getStructList = () => {
            let structs = [];
            let observations = this.imageData.tags['30060080'].value;
            if (observations == null) return structs;
            for (let obs of observations) {
                let dataVals = obs.value;
                let roi = Number(dataVals.find(obj => obj.id === "30060084").value[0]);
                structs.push({
                    name: String(dataVals.find(obj => obj.id === "30060085").value[0]),
                    roi: roi,
                    displayColor: this.contourData[roi].displayColor
                })
            }

            return structs;
        }

        this.patientPosition = ct.position
        this.pixelSpacing = ct.pixelSpacing;
        this.imageThickness = ct.thickness;
        this.contourData = getContour();
        this.structList = getStructList();
    }
}

export class CT extends DCM {

    constructor(filename, buffer) {

        super(filename, buffer)
        this.thickness = this.imageData.getSliceThickness();
        this.rows = this.imageData.getRows();
        this.cols = this.imageData.getCols();
        this.position = this.imageData.getImagePosition();
        this.interpretedData = this.imageData.getInterpretedData();
        this.pixelSpacing = this.imageData.getPixelSpacing();
    }
}

export class Series {

    constructor(ctArray) {

        function buildInterpolatedArray(images, thickness) {

            // function getInterpretedData(image) {
            //     let pixelBuffer = image.imageData.tags["7FE00010"].value.buffer;
            //     let intercept = image.imageData.tags["00281052"].value[0];
            //     let slope = image.imageData.tags["00281053"].value[0];
            //     let pixelArray = new Int16Array(pixelBuffer);
            //     return pixelArray.map(val => (val * slope) + intercept > 0 ? (val * slope) + intercept : 0)
            // }

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

        this.images = ctArray.sort((a, b) => a.position[2] - b.position[2]);
        this.thickness = ctArray[0].thickness;
        this.width = ctArray[0].cols;
        this.height = ctArray[0].imageData.tags["00280010"].value[0];
        this.depth = (ctArray.length - 1) * this.thickness + 1;
        this.imageArray = buildInterpolatedArray(this.images, this.thickness);
        this.minX = this.images[0].position[0];
        this.minY = this.images[0].position[1];
        this.minZ = this.images[0].position[2];
    }
}

export class BasicSeries {
    constructor(ctFiles) {
        function toArrayBuffer(b) {
            return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
        }

        function readFiles() {

            let fileList = [];
            for (let file of ctFiles) {
                const imageData = daikon.Series.parseImage(new DataView(toArrayBuffer(file.contents)))
                fileList.push({
                    filename: file.filename,
                    rows: imageData.getRows(),
                    cols: imageData.getCols(),
                    position: imageData.getImagePosition(),
                    seriesUID: imageData.getSeriesInstanceUID(),
                    studyUID: imageData.tags["0020000D"].value[0],
                    thickness: imageData.getSliceThickness(),
                    pixelSpacing: imageData.getPixelSpacing(),
                    patientName: imageData.getPatientName(),
                    patientID: imageData.getPatientID()
                })
            }

            return fileList;
        }

        function isSeries(ctInfo) {

            let isValid = ctInfo.length > 0;
            const first = ctInfo[0]
            isValid = isValid && ctInfo.every(file => file.rows === first.rows);
            isValid = isValid && ctInfo.every(file => file.cols === first.cols);
            isValid = isValid && ctInfo.every(file => file.seriesUID === first.seriesUID);
            isValid = isValid && ctInfo.every(file => file.studyUID === first.studyUID);
            isValid = isValid && ctInfo.every(file => file.thickness === first.thickness);
            isValid = isValid && ctInfo.every(file => file.position[0] === first.position[0] && file.position[1] === first.position[1]);
            isValid = isValid && ctInfo.every(file => file.pixelSpacing[0] === first.pixelSpacing[0] && file.pixelSpacing[1] === first.pixelSpacing[1]);
            isValid = isValid && ctInfo.every(file => file.patientName === first.patientName);
            isValid = isValid && ctInfo.every(file => file.patientID === first.patientID);

            if (!isValid) return isValid;

            let sortedCT = ctInfo.sort((a, b) => a.position[2] - b.position[2]);
            for (let i = 1; i < sortedCT.length; i++) {
                if (Math.abs(sortedCT[i].position[2] - sortedCT[i-1].position[2]) !== first.thickness) {
                    return false
                }
            }

            return isValid;
        }

        this.ctInfo = readFiles();
        this.isValid = isSeries(this.ctInfo);
        this.studyUID = this.ctInfo[0].studyUID;
        this.patientName = this.ctInfo[0].patientName;
        this.rows = this.ctInfo[0].rows;
        this.cols = this.ctInfo[0].cols;
    }
}

export class BasicRS {
    constructor(structFile) {
        function toArrayBuffer(b) {
            return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
        }

        this.isValid = structFile != null;
        this.filename = structFile.filename;
        const imageData = daikon.Series.parseImage(new DataView(toArrayBuffer(structFile.contents)));
        this.studyUID = imageData.tags["0020000D"].value[0];
    }
}