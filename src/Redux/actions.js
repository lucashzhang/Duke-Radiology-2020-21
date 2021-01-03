import C from './constants';
import { batch } from 'react-redux';

export const setFolderDirectory = (newDir) => {
    return {
        type: C.FILES.SET_DIRECTORY,
        payload: newDir
    }
}

export const setFolderStatus = (isValid) => {
    if (isValid) {
        return {
            type: C.FILES.FILE_STATUS_SUCCESS
        }
    } else if (isValid === false) {
        return {
            type: C.FILES.FILE_STATUS_FAILURE
        }
    } else {
        return {
            type: C.FILES.FILE_STATUS_INIT
        }
    }
}