import { Series } from './fileObjects'

export function buildSeries(ctArray) {
    console.log('building Series')
    return new Series(ctArray);
}