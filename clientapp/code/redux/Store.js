import {applyMiddleware, createStore} from "redux";
import thunk from "redux-thunk";
import rootReducer from './reducers';
import ChatsList from "../chat/classes/ChatsList";

const initialState = {
    auth:
        {
            isLoading: true,
            userToken: null,
            userId: 0,
        },
    chat: {
        chatsList: new ChatsList(),
        isChatInfoLoading: {},
        webSocket: null,
    }
};

const middleware = [thunk];

const store = createStore(rootReducer, initialState, applyMiddleware(...middleware));

export default store;