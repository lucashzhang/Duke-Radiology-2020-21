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

export const rdSummary = (state = {}, action) => {
    switch (action.type) {
        case C.FILES.SET_RD_SUMMARY:
            return action.payload
        case C.FILES.CLEAR_RD_SUMMARY:
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

export const structureList = (state = [], action) => {
    switch (action.type) {
        case C['SELECTIONDRAWER'].SET_STRUCTURES:
            return action.payload;
        case C['SELECTIONDRAWER'].CLEAR_STRUCTURES:
            return [];
        default:
            return state;
    }
}

export const selectedStructures = (state = {}, action) => {
    switch (action.type) {
        case C['SELECTIONDRAWER'].SET_SELECTED_STUCTURES:
            return action.payload;
        case C['SELECTIONDRAWER'].CLEAR_SELECTED_STRUCTURES:
            return {};
        default:
            return state;
    }
}

export const selectedDoses = (state = {}, action) => {
    switch (action.type) {
        case C['SELECTIONDRAWER'].SET_SELECTED_DOSES:
            return action.payload;
        case C['SELECTIONDRAWER'].CLEAR_SELECTED_DOSES:
            return {};
        default:
            return state;
    }
}

export default combineReducers({
    files: combineReducers({
        folderDirectory: folderDirectory,
        folderStatus: folderStatus,
        ctSummary: ctSummary,
        rsSummary: rsSummary,
        rdSummary: rdSummary
    }),
    patient: combineReducers({
        patientFirst,
        patientMiddle,
        patientLast
    }),
    selectionDrawer: combineReducers({
        structures: combineReducers({
            structureList,
            selectedStructures,
        }),
        doses: combineReducers({
            selectedDoses
        })
    })

})