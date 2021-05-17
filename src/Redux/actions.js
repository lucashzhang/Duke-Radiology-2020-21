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

export const handleNewFolder = (newDir, fileSummary) => (dispatch) => {

    batch(() => {
        // Set new folder directory
        dispatch(setFolderDirectory(newDir));
        // Set new summaries
        dispatch(setRSSummary(fileSummary.rsInfo));
        dispatch(setCTSummary(fileSummary.seriesInfo));
        dispatch(setRDSummary(fileSummary.rdInfo));
        dispatch(setFolderStatus(fileSummary.isValid));
        // Clearing selections from drawer
        dispatch({ type: C.SELECTIONDRAWER.CLEAR_STRUCTURES});
        dispatch({ type: C.SELECTIONDRAWER.CLEAR_SELECTED_STRUCTURES});
        dispatch({ type: C.SELECTIONDRAWER.CLEAR_SELECTED_DOSES});
    })
}