import C from './constants';
import { batch } from 'react-redux';

export const setFolderDirectory = (newDir) => {
    return {
        type: C.FILES.SET_DIRECTORY,
        payload: newDir
    }
}