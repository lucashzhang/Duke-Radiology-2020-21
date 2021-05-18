import { CT, RS, Series, RD, BasicSeries, BasicRS, BasicRD } from './fileObjects';

export function buildSeries(ctArray) {
    return new Series(ctArray);
}

export function buildRS(fileArray, ct) {
    let newRS = fileArray.map(file => new RS(file.filename, file.contents, ct));
    return newRS;
}

export function buildRD(fileArray, ct) {
    let newRD = fileArray.map(file => new RD(file.filename, file.contents, ct));
    return newRD;
}

export function buildCT(fileArray) {
    let newCT = fileArray.map(file => new CT(file.filename, file.contents));
    newCT = newCT.sort((a, b) => b.position[2] - a.position[2]);
    return newCT;
}

export function scanSeries(fileArray) {
    return new BasicSeries(fileArray);
}

export function scanRS(fileArray) {
    return new BasicRS(fileArray[0]);
}

export function scanRD(fileArray) {
    return new BasicRD(fileArray);
}