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

export const handleCheckedStructs = (structs) => {
    return {
        type: C.SELECTIONDRAWER.SET_SELECTED_STUCTURES,
        payload: structs
    }
}

export const setNewStructs = (structs) => (dispatch) => {

    const selected = {};
    for (let struct of structs) {
        selected[struct.roi] = false;
    }
    batch(() => {
        dispatch(handleCheckedStructs(selected));
        dispatch({
            type: C.SELECTIONDRAWER.SET_STRUCTURES,
            payload: structs
        })
    })
}

export const setNewDoses = (doses) => {
    const selected = {};
    for (let dose of doses) {
        selected[dose.filename] = false;
    }
    return {
        type: C.SELECTIONDRAWER.SET_DOSES,
        payload: selected
    }
}

export const handleCheckedDoses = (doses) => {
    return {
        type: C.SELECTIONDRAWER.SET_DOSES,
        payload: doses
    }
}

export const handleNewFolder = (newDir, fileSummary) => (dispatch) => {

    batch(() => {
        // Set new folder directory
        dispatch(setFolderDirectory(newDir));
        // Set new summaries
        dispatch(setRSSummary(fileSummary.rsInfo));
        dispatch(setCTSummary(fileSummary.seriesInfo));
        dispatch(setRDSummary(fileSummary.rdInfo));
        dispatch(setFolderStatus(fileSummary.isValid));
        // Create new drawer info
        dispatch(setNewStructs(fileSummary.rsInfo.structList))
        dispatch(setNewDoses(fileSummary.rdInfo.files))
    })
}