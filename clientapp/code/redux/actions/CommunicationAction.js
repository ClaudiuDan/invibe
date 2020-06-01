import Axios from "axios";
import {ADD_WEBSOCKET_CONNECTION, RETRY_MESSAGES} from "./Types";
import {newMessage, messagesRead, messagesReadEcho, messageEcho} from "./ChatAction";

const WebSocketURL = 'wss://invibes.herokuapp.com/chat/';
export const openWebSocket = () => dispatch => {
    const ws = new WebSocket(WebSocketURL);
    console.log("Opening websocket connection.");

    ws.onopen = () => {
        const handshake = {
            type: 'handshake',
            // TODO: Check if token exists(Error on sign out)
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

    addHandlersToWebSocket(ws);

    ws.onclose = (reason) => {
        console.log("onclose");
        setTimeout(() => dispatch(openWebSocket()), 1000);
    };

    dispatch({
        type: ADD_WEBSOCKET_CONNECTION,
        payload: {
            ws: ws
        }
    })
};

const addHandlersToWebSocket = (ws) => dispatch => {
    let closeConnection = setTimeout(() => ws.close(), 5000);

    ws.onmessage = (message) => {
        const messageData = JSON.parse(message.data);
        if (messageData.type === 'message_echo') {
            dispatch(messageEcho(messageData))

        } else if (messageData.type === 'new_match') {
            console.log("you have a new match")

        } else if (messageData.type === 'new_message') {
            dispatch(newMessage(messageData))

        } else if (messageData.type === 'messages_read') {
            dispatch(messagesRead(messageData))

        } else if (messageData.type === 'messages_read_echo') {
            dispatch(messagesReadEcho(messageData))

        } else if (messageData.type === '__pong__') {
            clearTimeout(closeConnection);
            setTimeout(() => {
                ws.send(JSON.stringify({'type': '__ping__'}));
            }, 2500);
            closeConnection = setTimeout(() => ws.close(), 5000);
        }

    }
};