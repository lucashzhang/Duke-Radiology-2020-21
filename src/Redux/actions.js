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

export const setRSSummary = (rs) => {
    return {
        type: C.FILES.SET_RS_SUMMARY,
        payload: rs ? rs : {}
    }
}

export const setCTSummary = (ct) => {
    return {
        type: C.FILES.SET_CT_SUMMARY,
        payload: ct ? ct : {}
    }
}

export const setRDSummary = (rd) => {
    return {
        type: C.FILES.SET_RD_SUMMARY,
        payload: rd ? rd : {}
    }
}

export const handleNewFolder = (newDir, fileSummary) => (dispatch) => {

    batch(() => {
        dispatch(setFolderDirectory(newDir));
        dispatch(setRSSummary(fileSummary.rsInfo));
        dispatch(setCTSummary(fileSummary.seriesInfo));
        dispatch(setRDSummary(fileSummary.rdInfo))
        dispatch(setFolderStatus(fileSummary.isValid));
    })
}