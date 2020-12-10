import constants from './constants';
import { combineReducers } from 'redux';

export const directory = (state = '', action) => {
    switch (action.type) {
        case constants['DIRECTORY'].SET_DIRECTORY:
            return action.payload;
        case constants['DIRECTORY'].CLEAR_DIRECTORY:
            return '';
        default:
            return state;
    }
}

export const patientFirst = (state = '', action) => {
    switch (action.type) {
        case constants['PATIENT'].SET_PATIENT_FIRST:
            return action.payload;
        case constants['PATIENT'].CLEAR_PATIENT_FIRST:
            return '';
        default:
            return state;
    }
}

export const patientMiddle = (state = '', action) => {
    switch (action.type) {
        case constants['PATIENT'].SET_PATIENT_MIDDLE:
            return action.payload;
        case constants['PATIENT'].CLEAR_PATIENT_MIDDLE:
            return '';
        default:
            return state;
    }
}

export const patientLast = (state = '', action) => {
    switch (action.type) {
        case constants['PATIENT'].SET_PATIENT_LAST:
            return action.payload;
        case constants['PATIENT'].CLEAR_PATIENT_LAST:
            return '';
        default:
            return state;
    }
}

export default combineReducers({
    directory: combineReducers({
        directory
    }),
    patient: combineReducers({
        patientFirst,
        patientMiddle,
        patientLast
    })
    
})