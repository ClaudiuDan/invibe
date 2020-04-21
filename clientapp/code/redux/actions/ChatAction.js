import Axios from "axios";
import {ADD_CHAT, ADD_MESSAGE, SET_CHAT, SET_CHATSLIST, UPDATE_MESSAGE} from "../actions/Types";
import {ADD_WEBSOCKET_CONNECTION, DELETE_CHAT, RETRY_MESSAGES} from "./Types";
import {parseISOString} from "../../Utils/Utils";
import {AsyncStorage} from "react-native";

const WebSocketURL = 'wss://invibes.herokuapp.com/chat/';

export const restoreChatsList = () => dispatch =>
    retrieveFromLocalStorage('chatsList', chatsList => {
            const chats = JSON.parse(chatsList);
            chats.forEach(chat => restoreChat(chat.receiver));

            dispatch({
                type: SET_CHATSLIST,
                payload: {
                    chatsList: chats,
                }
            })
        },
        'Could not restore chatslist from storage.');

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

            saveToLocalStorage('chatsList', JSON.stringify(chatsList), 'Could not save the chatsList.');

            dispatch({
                type: SET_CHATSLIST,
                payload: {
                    chatsList: chatsList,
                }
            })

        })
        .catch(error => console.log(error));
};


//TODO: Check if the chat is already in the list
export const addChat = (receiver) => dispatch => {
    Axios
        .post(`/chat/active_chats/`, {receiver: receiver})
        .then(response => {
                const chat = JSON.parse(response.data);
                const new_chat = {
                    id: chat.id,
                    receiver: chat.receiver
                };
                addChatToStorage(new_chat);
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

    retrieveFromLocalStorage('chatsList', chatList => {
            const parsedChatList = JSON.parse(chatList);
            const index = parsedChatList.findIndex(chat => chat.id.toString() === id.toString())
            if (index !== -1) {
                saveToLocalStorage(
                    'chatList',
                    JSON.stringify([...parsedChatList.slice(0, index), ...parsedChatList.slice(index + 1)]),
                    'Could not save the chat');
            }
        },
        'Could not get the chatList.');

    dispatch({
        type: DELETE_CHAT,
        payload: {
            id: id,
        }
    })
};

export const restoreChat = (receiver) => dispatch =>
    retrieveFromLocalStorage('chat-' + receiver.toString(),
        chat =>
            dispatch({
                type: SET_CHAT,
                payload: {
                    receiver: receiver,
                    chat: JSON.parse(chat),
                }
            }),
        'Could not restore chat.');


// TODO: Consider storing only the last n messages in the storage(Consider doing the same for the backend call)
// TODO: Consider adding to the current list of chats(or updating it) instead of replacing it
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

            saveToLocalStorage('chat-' + receiver.toString(), JSON.stringify(new_messages),
                'Could not save the chat for receiver ' + receiver.toString() + '.');

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


export const openWebSocketForChat = () => dispatch => {
    const ws = new WebSocket(WebSocketURL);
    console.log("Opening websocket connection.");
    let closeConnection = setTimeout(() => ws.close(), 5000);

    ws.onopen = () => {
        const handshake = {
            type: 'handshake',
            token: Axios.defaults.headers.common.Authorization.split(' ')[1],
        };

        ws.send(JSON.stringify(handshake));

        setTimeout(() => {
            ws.send(JSON.stringify({'type': '__ping__'}));
        }, 500);

        dispatch({
            type: RETRY_MESSAGES,
        })
    };

    ws.onmessage = (message) => {
        const messageData = JSON.parse(message.data);
        let new_message = {};
        let receiver = '';
        if (messageData.type === 'message_echo') {
            new_message = messageFromHTTPData('right', messageData);
            receiver = messageData.receiver.toString();
            dispatch({
                type: UPDATE_MESSAGE,
                payload: {
                    receiver: receiver,
                    message: new_message,
                }
            })
        } else if (messageData.type === 'new_message') {
            new_message = messageFromHTTPData('left', messageData);
            receiver = messageData.sender.toString();
            console.log("New message from ", receiver);
            dispatch({
                type: ADD_MESSAGE,
                payload: {
                    receiver: receiver,
                    message: new_message,
                }
            })
        } else if (messageData.type === '__pong__') {
            console.log('Received pong');
            clearTimeout(closeConnection);
            setTimeout(() => {
                ws.send(JSON.stringify({'type': '__ping__'}));
            }, 2500);
            closeConnection = setTimeout(() => ws.close(), 5000);
        }

        addMessageToStorage(receiver, new_message);
    };

    ws.onclose = (reason) => {
        console.log("onclose");
        setTimeout(() => dispatch(openWebSocketForChat()), 1000);
    };

    dispatch({
        type: ADD_WEBSOCKET_CONNECTION,
        payload: {
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
        created_timestamp: data.created_timestamp,
        id: data.id
    }
};


const saveToLocalStorage = async (key, data, errText) =>
    await AsyncStorage.setItem(key, data).catch(err => console.log(errText, err));


const retrieveFromLocalStorage = async (key, callback, errText) =>
    await AsyncStorage.getItem(key).then(value => {
        if (value) callback(value)
    })
        .catch(err => console.log(errText, err));


// TODO: Keep messages sorted by datetime
// TODO: Consider storing the messages individually to improve the update performance(or probably better in batches)
const addMessageToStorage = (receiver, message) => {
    const key = 'chat-' + receiver.toString();
    retrieveFromLocalStorage(key,
        chat =>
            saveToLocalStorage(key,
                JSON.stringify([...JSON.parse(chat), message]),
                'Could not save the message for receiver ' + receiver.toString()),
        'Could not get the chat for receiver ' + receiver.toString())
};

const addChatToStorage = (chat) =>
    retrieveFromLocalStorage('chatsList',
        chatList =>
            saveToLocalStorage('chatList', JSON.stringify([chat, ...JSON.parse(chatList)]),
                'Could not save the chat'),
        'Could not get the chatList');
