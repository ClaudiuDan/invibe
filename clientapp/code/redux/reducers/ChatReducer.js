import {
    ADD_CHAT,
    ADD_MESSAGE,
    ADD_WEBSOCKET_CONNECTION,
    DELETE_CHAT,
    MESSAGES_READ,
    RETRY_MESSAGES,
    SET_CHAT,
    SET_CHAT_INFO_LOADING_STATUS,
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
            if (!action.payload.chats) {
                return state;
            }

            if (!action.payload.isRetrieve) {
                for (const receiver in action.payload.chats) {
                    if (!(receiver in chatsInfo) || !chatsInfo[receiver]) {
                        action.payload.chats[receiver].save();
                    }
                }
            }

            return {
                ...state,
                chatsList: new ChatsList(action.payload.chats, !action.payload.isRetrieve)
            };

        case ADD_CHAT:
            chat = action.payload.chat;
            if (chat.id === -1) {
                // Adding a chatInfo which was not validated by the server
                newChatsList = chat.receiver in chatsInfo ? chatsList :
                    new ChatsList({
                        ...chatsInfo,
                        [chat.receiver]: new ChatInfo(chat.receiver, chat.id, true, chatsList.maxOrd + 1)
                    }, true);
            } else {
                // Adding a server validated chatInfo
                newChatsList = chat.receiver in chatsInfo
                    ?
                    new ChatsList({
                        ...chatsInfo,
                        [chat.receiver]: new ChatInfo(chat.receiver, chat.id, true, chatsInfo[chat.receiver].ord, chatsInfo[chat.receiver].messagesKeys, chatsInfo[chat.receiver].messages)
                    }, true)
                    :
                    new ChatsList({
                        ...chatsInfo,
                        [chat.receiver]: new ChatInfo(chat.receiver, chat.id, true, chatsList.maxOrd + 1)
                    }, true);
            }

            return {
                ...state,
                chatsList: newChatsList,
            };

        //TODO: delete from local memory
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
            chat = action.payload.chat;

            // Keep messages which have not been sent
            if (receiver in chatsInfo) {
                if (action.payload.onlyUpdates) {
                    // Only add the new messages received to the end of the chat
                    if (chat.length === 0) {
                        return state;
                    }

                    chat = [...chatsInfo[receiver].messages, ...chat];
                } else {
                    // Set the chat with the messages gathered from the db but keep the messages which have not been sent
                    const chatMessagesSet = new Set(chat.map(msg => msg.getUniqueKey()));
                    const sendingMessages = chatsInfo[receiver].messages.filter(msg => !(msg.sent || chatMessagesSet.has(msg.getUniqueKey())));
                    chat = [...chat, ...sendingMessages];
                }
            }

            chatsInfo[receiver] = receiver in chatsInfo
                ?
                new ChatInfo(receiver, chatsInfo[receiver].id, !action.payload.isRetrieve, chatsInfo[receiver].ord,
                    ChatInfo.getMessageKeysFromMessages(chat), chat)
                :
                new ChatInfo(receiver, -1, !action.payload.isRetrieve, chatsList.maxOrd + 1,
                    ChatInfo.getMessageKeysFromMessages(chat), chat);

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

            chatsInfo[receiver] = new ChatInfo(receiver, chatsInfo[receiver].id, true,
                chatsList.maxOrd + 1,
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

        case MESSAGES_READ:

            // TODO: this check is for when the messages_read is received before creating a chat info. Replace this with proper handling
            if (!chatsInfo[action.payload.receiver]) {
                return state;
            }

            chatsInfo[action.payload.receiver] = chatsInfo[action.payload.receiver]
                .markMessagesAsRead(action.payload.up_to_created_timestamp, action.payload.direction);
            return {
                ...state,
                chatsList: new ChatsList({...chatsInfo})
            };

        case ADD_WEBSOCKET_CONNECTION:

            return {
                ...state,
                webSocket: action.payload.ws,
            };

        case SET_CHAT_INFO_LOADING_STATUS:

            return {
                ...state,
                isChatInfoLoading: {
                    ...state.isChatInfoLoading,
                    [action.payload.receiver]: action.payload.loading,
                }
            };

        default:
            return state
    }
}

export default chatReducer;