import C from './constants';
import { batch } from 'react-redux';
// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from 'workerize-loader!../Backend/file.worker.js'

export const setFolderDirectory = (newDir) => {
    return {
        type: C.FILES.SET_DIRECTORY,
        payload: newDir
    }
}

export const createSeries = (ctArray) => async (dispatch) => {
    const inst = new Worker();
    let newSeries = await inst.buildSeries(ctArray);
    
    dispatch({
        type: C.FILES.SET_SERIES,
        payload: newSeries
    })
}