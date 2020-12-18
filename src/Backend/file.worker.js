import { object } from 'underscore';
import { CT, RS, Series } from './fileObjects';

export function buildSeries(ctArray) {
    return new Series(ctArray);
}

export function buildRS(fileArray) {
    let newRS = [];
    for (let file of fileArray) {
        newRS.push(new RS(file.filename, file.contents));
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