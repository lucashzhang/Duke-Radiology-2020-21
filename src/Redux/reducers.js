import C from './constants';
import { combineReducers } from 'redux';

export const folderDirectory = (state = '', action) => {
    switch (action.type) {
        case C['FILES'].SET_DIRECTORY:
            return action.payload;
        case C['FILES'].CLEAR_DIRECTORY:
            return '';
        default:
            return state;
    }
}

export const ctSummary = (state = {}, action) => {
    switch (action.type) {
        case C.FILES.SET_CT_SUMMARY:
            return action.payload
        case C.FILES.CLEAR_CT_SUMMARY:
            return {};
        default:
            return state;
    }
}

export const rsSummary = (state = {}, action) => {
    switch (action.type) {
        case C.FILES.SET_RS_SUMMARY:
            return action.payload
        case C.FILES.CLEAR_RS_SUMMARY:
            return {};
        default:
            return state;
    }
}

export const folderStatus = (state = C['FILES'].FILE_STATUS_INIT, action) => {
    switch (action.type) {
        case C['FILES'].FILE_STATUS_INIT:
            return C['FILES'].FILE_STATUS_INIT;
        case C['FILES'].FILE_STATUS_SUCCESS:
            return C['FILES'].FILE_STATUS_SUCCESS;
        case C['FILES'].FILE_STATUS_FAILURE:
            return C['FILES'].FILE_STATUS_FAILURE;
        default:
            return state;
    }
}

export const patientFirst = (state = '', action) => {
    switch (action.type) {
        case C['PATIENT'].SET_PATIENT_FIRST:
            return action.payload;
        case C['PATIENT'].CLEAR_PATIENT_FIRST:
            return '';
        default:
            return state;
    }
}

export const patientMiddle = (state = '', action) => {
    switch (action.type) {
        case C['PATIENT'].SET_PATIENT_MIDDLE:
            return action.payload;
        case C['PATIENT'].CLEAR_PATIENT_MIDDLE:
            return '';
        default:
            return state;
    }
}

export const patientLast = (state = '', action) => {
    switch (action.type) {
        case C['PATIENT'].SET_PATIENT_LAST:
            return action.payload;
        case C['PATIENT'].CLEAR_PATIENT_LAST:
            return '';
        default:
            return state;
    }
}

export default combineReducers({
    files: combineReducers({
        folderDirectory: folderDirectory,
        folderStatus: folderStatus,
        ctSummary: ctSummary,
        rsSummary: rsSummary
    }),
    patient: combineReducers({
        patientFirst,
        patientMiddle,
        patientLast
    })
    
})