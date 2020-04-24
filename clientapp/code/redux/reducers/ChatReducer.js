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
    const chatsInfo = state.chatsList ? state.chatsList.chatsInfo : null;
    const chatsList = state.chatsList;

    let receiver = null;
    let chat = null;
    let message = null;
    let newChatsList = null;

    switch (action.type) {

        case SET_CHATSLIST:
            return {
                ...state,
                chatsList: new ChatsList(action.payload.chats, true)
            };

        case ADD_CHAT:
            chat = action.payload.chat;

            if (chat.id === -1) {
                // Adding a chatInfo which was not validated by the server
                newChatsList = chat.receiver in chatsInfo ? chatsList :
                    new ChatsList({
                        ...chatsInfo,
                        [chat.receiver]: new ChatInfo(chat.receiver, chat.id, chatsList.maxOrd + 1)
                    }, true);
            } else {
                // Adding a server validated chatInfo
                newChatsList = chat.receiver in chatsInfo
                    ?
                    new ChatsList({
                        ...chatsInfo,
                        [chat.receiver]: new ChatInfo(chat.receiver, chat.id, chatsInfo[chat.receiver].ord, chatsInfo[chat.receiver].messagesKeys, chatsInfo[chat.receiver].messages)
                    }, true)
                    :
                    new ChatsList({
                        ...chatsInfo,
                        [chat.receiver]: new ChatInfo(chat.receiver, chat.id, chatsList.maxOrd + 1)
                    }, true);
            }

            return {
                ...state,
                chatsList: newChatsList,
            };

        case DELETE_CHAT:
            receiver = action.payload.receiver;

            if (!(receiver in chatsInfo)) {
                return state;
            }
            delete chatsInfo[receiver];
            return {
                ...state,
                chatsList: new ChatsList({...chatsInfo}, true)
            };

        case SET_CHAT:
            receiver = action.payload.receiver;

            chatsInfo[receiver] = receiver in chatsInfo
                ?
                new ChatInfo(receiver, chatsInfo[receiver].id, chatsInfo[receiver].ord,
                    ChatInfo.getMessageKeysFromMessages(action.payload.chat), action.payload.chat)
                :
                new ChatInfo(receiver, -1, chatsList.maxOrd + 1,
                    ChatInfo.getMessageKeysFromMessages(action.payload.chat), action.payload.chat);

            return {
                ...state,
                chatsList: new ChatsList({...chatsInfo})
            };

        case RETRY_MESSAGES:

            for (receiver in chatsInfo) {
                chatsInfo[receiver].messages.forEach(msg => {
                    if (!msg.sent) {
                        msg.sendMessageViaWebSocket(state.webSocket);
                    }
                });
            }

            return state;

        case ADD_MESSAGE:

            receiver = action.payload.message.receiver;
            message = action.payload.message;

            if (message.direction === "right") {
                message.sendMessageViaWebSocket(state.webSocket);
            }

            chatsInfo[receiver] = new ChatInfo(receiver, chatsInfo[receiver].id, chatsList.maxOrd + 1,
                [...chatsInfo[receiver].messagesKeys, message.getUniqueKey()],
                [...chatsInfo[receiver].messages, message]);

            return {
                ...state,
                chatsList: new ChatsList({...chatsInfo})
            };

        case UPDATE_MESSAGE:
            message = action.payload.message;
            chatsInfo[message.receiver] = chatsInfo[message.receiver].updateMessage(message);

            return {
                ...state,
                chatsList: new ChatsList({...chatsInfo})
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

export default chatReducer;