import ChatMessage from "./ChatMessage";
import {messageType, messageTypesForServer} from "./ChatMessageTypes";
import {MessageBox, TextContent} from "../../components/MessageBox";
import React from "react";

export default class TextChatMessage extends ChatMessage {
    constructor(text, ...args) {
        super(...args);
        this._text = text;

        if (this.saveContent) {
            this.save();
        }
    }

    static instanceFromDictionary(dic) {
        return new TextChatMessage(dic.text, dic.direction, dic.receiver, false, dic.sent, dic.datetime, dic.createdTimestamp, dic.id, dic.seen);
    }

    getComponentToRender(key, _navigation) {
        return (
            <MessageBox key={key}
                        direction={this.direction}
                        text={this.text}
                        datetime={this.datetime}
                        sent={this.sent}
                        seen={this.seen}
                        content={<TextContent text={this.text} direction={this.direction}/>}
            />
        );
    }

    sendMessageViaWebSocket(ws) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'message',  // Specific for the websocket connection with the server
                message_type: messageTypesForServer.TEXT_MESSAGE,
                text: this.text,
                receiver: this.receiver,
                created_timestamp: this.createdTimestamp,
            }));
        }
    }

    getDictionary() {
        return {
            ...super.getDictionary(),
            text: this.text,
            type: messageType.TEXT
        };
    }

    get text() {
        return this._text;
    }

}