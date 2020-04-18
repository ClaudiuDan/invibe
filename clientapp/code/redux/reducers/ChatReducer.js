import {
    ADD_CHAT,
    ADD_MESSAGE,
    ADD_WEBSOCKET_CONNECTION,
    DELETE_CHAT,
    SET_CHAT,
    SET_CHATSLIST,
    UPDATE_MESSAGE
} from "../actions/Types";

function chatReducer(state = {}, action) {
    let receiver = null;
    let index = 0;
    switch (action.type) {
        case SET_CHATSLIST:
            return {
                ...state,
                chatsList: action.payload.chatsList,
            };

        case ADD_CHAT:
            return {
                ...state,
                chatsList: [action.payload.chat, ...state.chatsList]
            };

        case DELETE_CHAT:
            const chatsList = state.chatsList;
            index = chatsList.findIndex(chat => chat.id.toString() === action.payload.id.toString());
            if (index !== -1) {
                return {
                    ...state,
                    chatsList: [...chatsList.slice(0, index), ...chatsList.slice(index + 1)]
                };
            }
            return state;

        case SET_CHAT:
            return {
                ...state,
                messages: {
                    ...state.messages,
                    [action.payload.receiver]: action.payload.chat, // [key]: Computed property names
                }
            };

        case ADD_MESSAGE:
            receiver = action.payload.receiver;
            const old_messages = receiver in state.messages ? state.messages[receiver] : [];
            return {
                ...state,
                messages: {
                    ...state.messages,
                    [receiver]: [...old_messages, action.payload.message]
                }
            };

        case UPDATE_MESSAGE:
            receiver = action.payload.receiver;
            // TODO: Consider doing binary search if stored sorted by datetime
            // TODO: the frontend_id is not stored in the db in a persistent way, consider checking for id as well(maybe improve this design)
            const messages = receiver in state.messages ? state.messages[receiver] : [];
            const message = action.payload.message;
            index = messages.findIndex((msg) => msg.frontend_id && msg.frontend_id.toString() === message.frontend_id.toString());
            if (index !== -1) {
                return {
                    ...state,
                    messages: {
                        ...state.messages,
                        [receiver]: [...messages.slice(0, index), message, ...messages.slice(index + 1)]
                    }
                };
            }
            return state;
        case ADD_WEBSOCKET_CONNECTION:
            return {
                ...state,
                webSocket: action.payload.ws,
            };

        default:
            return state
    }
}

export default chatReducer;