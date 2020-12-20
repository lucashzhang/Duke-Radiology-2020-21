import { createStore, applyMiddleware } from 'redux'
import appReducer from './reducers'
import thunk from 'redux-thunk'

const create = () => {
	return createStore(appReducer, applyMiddleware(thunk));
}

export const loadState = () => {
	try {
		const serializedState = localStorage.getItem('redux-state');
		if (serializedState === null) {
			return undefined;
		}
		return JSON.parse(serializedState);
	} catch (err) {
		return undefined;
	}
};

// localStorage.js
export const saveState = (state) => {
	try {
		const serializedState = JSON.stringify(state);
		localStorage.setItem('redux-state', serializedState);
	} catch {
		// ignore write errors
	}
};

export default create;