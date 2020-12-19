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
    }),
    patient: combineReducers({
        patientFirst,
        patientMiddle,
        patientLast
    })
    
})