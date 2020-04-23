import {
    ADD_CHAT,
    ADD_MESSAGE,
    ADD_WEBSOCKET_CONNECTION,
    DELETE_CHAT,
    RETRY_MESSAGES,
    SET_CHAT,
    SET_CHATSLIST,
    UPDATE_MESSAGE
} from "../actions/Types";
import ChatsList from "../../chat/classes/ChatsList";
import ChatInfo from "../../chat/classes/ChatInfo";

function chatReducer(state = {}, action) {
    let receiver = null;
    let chat = null;
    let chatsList = state.chatsList ? state.chatsList.chatsInfo : null;
    let message = null;

    switch (action.type) {
        case SET_CHATSLIST:
            return {
                ...state,
                chatsList: new ChatsList(action.payload.chats)
            };

        case ADD_CHAT:
            chat = action.payload.chat;

            let currMessagesKeys = [];
            let currMessages = [];
            if (receiver in chatsList) {
                currMessagesKeys = chatsList[receiver].messagesKeys;
                currMessages = chatsList[receiver].messages;
            }

            return {
                ...state,
                chatsList: new ChatsList({
                    ...state.chatsList.chatsInfo,
                    [chat.receiver.toString()]: new ChatInfo(chat.receiver,
                        chat.id,
                        state.chatsList.maxOrd + 1,
                        currMessagesKeys,
                        currMessages)
                })
            };

        case DELETE_CHAT:
            receiver = action.payload.receiver;
            if (!(receiver in chatsList)) {
                return state;
            }
            delete chatsList[receiver];
            return {
                ...state,
                chatsList: new ChatsList({...chatsList})
            };

        case SET_CHAT:
            receiver = action.payload.receiver.toString();
            let id = 0;
            let ord = state.chatsList.maxOrd + 1;
            if (receiver in chatsList) {
                id = chatsList[receiver].id;
                ord = chatsList[receiver].ord;
            }

            chatsList[receiver] = new ChatInfo(receiver, id, ord,
                ChatInfo.getMessageKeysFromMessages(action.payload.chat), action.payload.chat);

            return {
                ...state,
                chatsList: new ChatsList({...chatsList})
            };

        case RETRY_MESSAGES:
            for (receiver in chatsList) {
                chatsList[receiver].messages.forEach(msg => {
                    if (!msg.sent) {
                        sendMessageViaWebSocket(msg, state.webSocket, receiver);
                    }
                });
            }

            return state;

        case ADD_MESSAGE:
            receiver = action.payload.message.receiver.toString();
            message = action.payload.message;

            if (message.direction === "right") {
                sendMessageViaWebSocket(action.payload.message, state.webSocket, receiver);
            }
            chatsList[receiver] = new ChatInfo(receiver, chatsList[receiver].id, chatsList.maxOrd + 1,
                [...chatsList[receiver].messagesKeys, message.getUniqueKey()],
                [...chatsList[receiver].messages, message]);

            return {
                ...state,
                chatsList: new ChatsList({...chatsList})
            };

        case UPDATE_MESSAGE:
            message = action.payload.message;
            chatsList[message.receiver] = chatsList[message.receiver].updateMessage(message);

            return {
                ...state,
                chatsList: new ChatsList({...chatsList})
            };

        case ADD_WEBSOCKET_CONNECTION:
            return {
                ...state,
                webSocket: action.payload.ws,
            };

        default:
            return state
    }
}

const sendMessageViaWebSocket = (msg, ws, receiver) => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'message',
            text: msg.text,
            receiver: receiver,
            created_timestamp: msg.createdTimestamp,
        }));
    }
};

export default chatReducer;