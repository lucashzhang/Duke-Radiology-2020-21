import { CT, RS, Series, BasicSeries, BasicRS, BasicRD } from './fileObjects';

export function buildSeries(ctArray) {
    return new Series(ctArray);
}

export function buildRS(fileArray, ct) {
    let newRS = [];
    for (let file of fileArray) {
        newRS.push(new RS(file.filename, file.contents, ct));
    }
    return newRS;
}

export function buildCT(fileArray) {
    let newCT = [];
    for (let file of fileArray) {
        newCT.push(new CT(file.filename, file.contents));
    }
    return newCT;
}

export function scanSeries(fileArray) {
    return new BasicSeries(fileArray);
}

export function scanRS(fileArray) {
    return new BasicRS(fileArray[0]);
}

export function scanRD(fileArray) {
    return new BasicRD(fileArray[0]);
}