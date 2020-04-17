import {applyMiddleware, createStore} from "redux";
import thunk from "redux-thunk";
import rootReducer from './reducers';

const initialState = {
    auth:
        {
            isLoading: true,
            userToken: null,
        },
    chat: {
        chatsList: [],
        messages: {},
        webSockets: {},
    }
};

const middleware = [thunk];

const store = createStore(rootReducer, initialState, applyMiddleware(...middleware));

export default store;