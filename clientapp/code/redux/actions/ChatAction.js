import Axios from "axios";
import {ADD_CHAT, ADD_MESSAGE, SET_CHAT, SET_CHATSLIST, UPDATE_MESSAGE} from "../actions/Types";
import {
    ADD_WEBSOCKET_CONNECTION,
    DELETE_CHAT,
    MESSAGES_READ,
    RETRY_MESSAGES,
    SET_CHAT_INFO_LOADING_STATUS
} from "./Types";
import ChatInfo, {ChatInfoStatus} from "../../chat/classes/ChatInfo";
import ChatsList from "../../chat/classes/ChatsList";
import {messageFromServerData} from "../../Utils/ChatUtils";
import ImageChatMessage from "../../chat/classes/messagesTypes/ImageChatMessage";
import * as FileSystem from "expo-file-system";
import {messageTypesForServer} from "../../chat/classes/messagesTypes/ChatMessageTypes";

const WebSocketURL = 'wss://invibes.herokuapp.com/chat/';

export const retrieveChatsList = () => dispatch => {
    ChatsList.retrieve().then(chats => {
            dispatch({
                type: SET_CHATSLIST,
                payload: {
                    isRetrieve: true,
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
                    chats[chat.receiver] = new ChatInfo(chat.receiver, chat.id, false, parsedChats.length - index);
                });

            dispatch({
                type: SET_CHATSLIST,
                payload: {
                    isRetrieve: false,
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
export const getChat = (receiver, onlyUpdates) => dispatch => {
    dispatch(setChatInfoLoadingStatus(receiver, ChatInfoStatus.LOADING));
    console.log("get chat", "only updates", onlyUpdates);

    Axios
        .get(`/chat/get_chat/`, {params: {receiver: receiver, only_updates: onlyUpdates}})
        .then(response => {
            const newMessages = [];
            JSON.parse(response.data).messages
                .forEach(message => {
                    if (message.sender.toString() === receiver.toString()) {
                        newMessages.push(messageFromServerData('left', message))
                    } else {
                        newMessages.push(messageFromServerData('right', message))
                    }
                });

            dispatch({
                type: SET_CHAT,
                payload: {
                    receiver: receiver,
                    chat: newMessages,
                    isRetrieve: false,
                    onlyUpdates: onlyUpdates
                }
            });

            dispatch(setChatInfoLoadingStatus(receiver, ChatInfoStatus.LOADED));

        })
        .catch(error => console.log(error));
};

export const retrieveChat = (chatInfo) => dispatch => {

    dispatch(setChatInfoLoadingStatus(chatInfo.receiver, ChatInfoStatus.LOADING));

    chatInfo.retrieveMessages().then(chat => {
            console.log("Retrieved", chat.length, "messages from memory.");
            dispatch({
                type: SET_CHAT,
                payload: {
                    receiver: chatInfo.receiver,
                    chat: chat,
                    isRetrieve: true,
                    onlyUpdates: false,
                }
            });

            const onlyUpdates = chat.length > 0;

            if (onlyUpdates) {
                dispatch(setChatInfoLoadingStatus(chatInfo.receiver, ChatInfoStatus.LOADED));
            }

            setTimeout(() => {
                dispatch(getChat(chatInfo.receiver, onlyUpdates))
            }, 100);
        }
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

        } else if (messageData.type === 'messages_read') {
            dispatch({
                type: MESSAGES_READ,
                payload: {
                    receiver: messageData.receiver,
                    up_to_created_timestamp: messageData.up_to_created_timestamp,
                    direction: "right"
                }
            })
        } else if (messageData.type === 'messages_read_echo') {
            dispatch({
                type: MESSAGES_READ,
                payload: {
                    receiver: messageData.receiver,
                    up_to_created_timestamp: messageData.up_to_created_timestamp,
                    direction: "left"
                }
            })
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

export const retrieveImages = (chatInfo) => dispatch => {
    chatInfo.messages.forEach(msg => {
       if ((msg instanceof ImageChatMessage) && msg.base64Content === "") {
           FileSystem.readAsStringAsync(msg.path, {encoding: FileSystem.EncodingType.Base64})
               .then(result => {
                   msg.base64Content = result;
                   dispatch({
                       type: UPDATE_MESSAGE,
                       payload: {
                           message: msg,
                       }
                   })
               })
               .catch(err => {
                   if (msg.id > 0) {
                       console.log("Could not retrieve image from chat", err);
                       console.log("Getting it from server");
                       Axios
                           .get(`/chat/get_message_image/`, {
                               params: {
                                   message_type: messageTypesForServer.IMAGE_MESSAGE,
                                   message_id: msg.id
                               }
                           })
                           .then(response => {
                               msg.base64Content = JSON.parse(response.data).base64_content;
                               msg.save();
                               dispatch({
                                   type: UPDATE_MESSAGE,
                                   payload: {
                                       message: msg,
                                   }
                               })
                           })
                           .catch(error => console.log(error));
                   }
               })
       }
    });
};

export const setChatInfoLoadingStatus = (receiver, loading) => dispatch => {
    dispatch({
        type: SET_CHAT_INFO_LOADING_STATUS,
        payload: {
            receiver: receiver,
            loading: loading
        }
    })
};