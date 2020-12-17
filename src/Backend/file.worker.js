import { Series } from './ctObjects'

export function buildSeries(ctArray) {
    console.log('building Series')
    return new Series(ctArray);
}