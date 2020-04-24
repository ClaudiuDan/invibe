import Axios from "axios";
import {ADD_CHAT, ADD_MESSAGE, SET_CHAT, SET_CHATSLIST, UPDATE_MESSAGE} from "../actions/Types";
import {ADD_WEBSOCKET_CONNECTION, DELETE_CHAT, RETRY_MESSAGES} from "./Types";
import ChatInfo from "../../chat/classes/ChatInfo";
import ChatsList from "../../chat/classes/ChatsList";
import {messageFromServerData} from "../../chat/classes/ChatUtils";

const WebSocketURL = 'wss://invibes.herokuapp.com/chat/';

export const retrieveChatsList = () => dispatch => {
    ChatsList.retrieve().then(chats => {
            dispatch({
                type: SET_CHATSLIST,
                payload: {
                    chats: chats,
                }
            })
        }
    ).catch(
        err => console.log("Error in chatsList retrieve action", err)
    );
};

export const getChatsList = () => dispatch => {
    Axios
        .get(`/chat/active_chats/`)
        .then(response => {
            const parsedChats = JSON.parse(response.data).chats;
            const chats = {};
            parsedChats
                .forEach((chat, index) => {
                    chats[chat.receiver] = new ChatInfo(chat.receiver, chat.id, parsedChats.length - index);
                });

            dispatch({
                type: SET_CHATSLIST,
                payload: {
                    chats: chats,
                }
            })

        })
        .catch(error => console.log(error));
};


//TODO: Check if the chat is already in the list
export const addChat = (receiver) => dispatch => {
    dispatch({
        type: ADD_CHAT,
        payload: {
            chat: {receiver: receiver, id: -1},
        }
    });

    Axios
        .post(`/chat/active_chats/`, {receiver: receiver})
        .then(response => {
                const chat = JSON.parse(response.data);

                dispatch({
                    type: ADD_CHAT,
                    payload: {
                        chat: chat,
                    }
                })
            }
        )
        .catch(error => console.log(error));
};

export const deleteChat = (chat) => dispatch => {
    Axios
        .delete(`/chat/active_chats/`, {params: {id: chat.id}})
        .catch(error => console.log(error));

    dispatch({
        type: DELETE_CHAT,
        payload: {
            receiver: chat.receiver,
        }
    })
};

// TODO: Consider storing only the last n messages in the storage(Consider doing the same for the backend call)
// TODO: Consider adding to the current list of chats(or updating it) instead of replacing it
export const getChat = (receiver) => dispatch => {
    Axios
        .get(`/chat/get_chat/`, {params: {receiver: receiver}})
        .then(response => {
            const new_messages = [];
            JSON.parse(response.data).messages
                .forEach(message => {
                    if (message.sender.toString() === receiver.toString()) {
                        new_messages.push(messageFromServerData('left', message))
                    } else {
                        new_messages.push(messageFromServerData('right', message))
                    }
                });

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

export const retrieveChat = (chatInfo) => dispatch => {
    chatInfo.retrieveMessages().then(chat =>
        dispatch({
            type: SET_CHAT,
            payload: {
                receiver: chatInfo.receiver,
                chat: chat,
            }
        })
    ).catch(err => console.log("Error in retrieveChat Action.", err));
};


export const addMessage = (message) => dispatch => {
    dispatch({
        type: ADD_MESSAGE,
        payload: {
            message: message,
        }
    });
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
        if (messageData.type === 'message_echo') {
            new_message = messageFromServerData('right', messageData);
            dispatch({
                type: UPDATE_MESSAGE,
                payload: {
                    message: new_message,
                }
            });

        } else if (messageData.type === 'new_message') {
            new_message = messageFromServerData('left', messageData);
            dispatch({
                type: ADD_MESSAGE,
                payload: {
                    message: new_message,
                }
            });

        } else if (messageData.type === '__pong__') {
            clearTimeout(closeConnection);
            setTimeout(() => {
                ws.send(JSON.stringify({'type': '__ping__'}));
            }, 2500);
            closeConnection = setTimeout(() => ws.close(), 5000);
        }

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