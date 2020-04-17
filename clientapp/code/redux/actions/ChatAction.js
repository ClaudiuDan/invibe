import * as SecureStore from "expo-secure-store";
import Axios from "axios";
import {ADD_CHAT, ADD_MESSAGE, SET_CHAT, SET_CHATSLIST, UPDATE_MESSAGE} from "../actions/Types";
import {ADD_WEBSOCKET_CONNECTION, DELETE_CHAT} from "./Types";
import {parseISOString} from "../../Utils/Utils";


const WebSocketURL = 'wss://invibes.herokuapp.com/chat/';

export const restoreChatsList = () => dispatch => {
    SecureStore.getItemAsync('chatsList')
        .then(chatsList => {
            if (chatsList) {
                const chats = JSON.parse(chatsList);
                chats.forEach(chat => restoreChat(chat.receiver));

                dispatch({
                    type: SET_CHATSLIST,
                    payload: {
                        chatsList: chats,
                    }
                })
            }
        })
        .catch(err => console.log(err));
};

export const getChatsList = () => dispatch => {
    Axios
        .get(`/chat/active_chats/`)
        .then(response => {
            const chatsList = [];
            JSON.parse(response.data).chats
                .forEach(chat => {
                    chatsList.push({
                        id: chat.id,
                        receiver: chat.receiver
                    })
                });

            SecureStore.setItemAsync('chatsList', JSON.stringify(chatsList))
                .catch(err => console.log('Could not save the chatsList.', err));

            dispatch({
                type: SET_CHATSLIST,
                payload: {
                    chatsList: chatsList,
                }
            })

        })
        .catch(error => console.log(error));
};

export const addChat = (receiver) => dispatch => {
    Axios
        .post(`/chat/active_chats/`, {receiver: receiver})
        .then(response => {
                const chat = JSON.parse(response.data);
                const new_chat = {
                    id: chat.id,
                    receiver: chat.receiver
                };
                addChatToSecureStorage(new_chat);
                dispatch({
                    type: ADD_CHAT,
                    payload: {
                        chat: new_chat,
                    }
                })
            }
        )
        .catch(error => console.log(error));
};

export const deleteChat = (id) => dispatch => {
    Axios
        .delete(`/chat/active_chats/`, {params: {id: id}})
        .catch(error => console.log(error));

    SecureStore.getItemAsync('chatsList')
        .then(chatList => {
            const parsedChatList = JSON.parse(chatList);
            const index = parsedChatList.findIndex(chat => chat.id.toString() === id.toString())
            if (index !== -1) {
                SecureStore
                    .setItemAsync('chatList',
                        JSON.stringify([...parsedChatList.slice(0, index), ...parsedChatList.slice(index + 1)]))
                    .catch(err => console.log('Could not save the chat', err));
            }
        })
        .catch(err => console.log('Could not get the chatList', err));

    dispatch({
        type: DELETE_CHAT,
        payload: {
            id: id,
        }
    })
};

export const restoreChat = (receiver) => dispatch => {
    SecureStore.getItemAsync('chat-' + receiver.toString())
        .then(chat => {
            if (chat) {
                dispatch({
                    type: SET_CHAT,
                    payload: {
                        receiver: receiver,
                        chat: JSON.parse(chat),
                    }
                })
            }
        })
        .catch(err => console.log(err));
};


// TODO: Consider storing only the last n messages in the storage(Consider doing the same for the backend call)
export const getChat = (receiver) => dispatch => {
    Axios
        .get(`/chat/get_chat/`, {params: {receiver: receiver}})
        .then(response => {
            const messages = JSON.parse(response.data).messages;
            const new_messages = [];
            messages
                .forEach(message => {
                    if (message.sender.toString() === receiver.toString()) {
                        new_messages.push(messageFromHTTPData('left', message))
                    } else {
                        new_messages.push(messageFromHTTPData('right', message))
                    }
                });

            SecureStore.setItemAsync('chat-' + receiver.toString(), JSON.stringify(new_messages))
                .catch(err => console.log('Could not save the chat for receiver ' + receiver.toString(), err));

            dispatch({
                type: SET_CHAT,
                payload: {
                    receiver: receiver,
                    chat: new_messages,
                }
            })
        })
        .catch(error => console.log(error));
};

export const addMessage = (message, receiver) => dispatch => {
    dispatch({
        type: ADD_MESSAGE,
        payload: {
            receiver: receiver,
            message: message,
        }
    })
};

export const openWebSocketForChat = (receiver) => dispatch => {
    console.log("openwebsocketforchat", receiver)
    const ws = new WebSocket(WebSocketURL);

    ws.onopen = () => {
        const handshake = {
            type: 'handshake',
            receiver: receiver,
            token: Axios.defaults.headers.common.Authorization.split(' ')[1],
        };

        ws.send(JSON.stringify(handshake));
    };

    ws.onmessage = (message) => {
        const messageData = JSON.parse(message.data);
        let new_message = {};
        if (messageData.type === 'message_echo') {
            new_message = messageFromHTTPData('right', messageData);
            dispatch({
                type: UPDATE_MESSAGE,
                payload: {
                    receiver: receiver,
                    message: new_message,
                }
            })
        } else if (messageData.type === 'new_message') {
            new_message = messageFromHTTPData('left', messageData);
            dispatch({
                type: ADD_MESSAGE,
                payload: {
                    receiver: receiver,
                    message: new_message,
                }
            })
        }

        addMessageToSecureStorage(receiver, new_message);
    };

    ws.onclose = (reason) => {
        console.log(reason);
        setTimeout(() => openWebSocketForChat(receiver), 3000);
    };

    dispatch({
        type: ADD_WEBSOCKET_CONNECTION,
        payload: {
            receiver: receiver,
            ws: ws
        }
    })
};

const messageFromHTTPData = (direction, data) => {
    return {
        direction: direction,
        text: data.text,
        datetime: parseISOString(data.datetime),
        sent: true,
        frontend_id: data.frontend_id,
        id: data.id
    }
};


// TODO: Keep messages sorted by datetime
// TODO: Consider storing the messages individually to improve the update performance
const addMessageToSecureStorage = (receiver, message) => {
    const key = 'chat-' + receiver.toString();
    SecureStore.getItemAsync(key)
        .then(chat =>
            SecureStore
                .setItemAsync(key, JSON.stringify([...JSON.parse(chat), message]))
                .catch(err => console.log('Could not save the message for receiver ' + receiver.toString(), err)))
        .catch(err => console.log('Could not get the chat for receiver ' + receiver.toString(), err));
};

const addChatToSecureStorage = (chat) => {
    SecureStore.getItemAsync('chatsList')
        .then(chatList =>
            SecureStore
                .setItemAsync('chatList', JSON.stringify([chat, ...JSON.parse(chatList)]))
                .catch(err => console.log('Could not save the chat', err)))
        .catch(err => console.log('Could not get the chatList', err));
};