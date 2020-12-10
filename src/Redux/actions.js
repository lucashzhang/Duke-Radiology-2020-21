import C from './constants';
import { batch } from 'react-redux';

export const setFolderDirectory = (newDir) => {
    return {
        type: C.DIRECTORY.SET_DIRECTORY,
        payload: newDir
    }
}