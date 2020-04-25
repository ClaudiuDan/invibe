import ChatMessage from "./ChatMessage";
import {messageType} from "./ChatMessageTypes";
import {ImageContent, MessageBox} from "../../components/MessageBox";
import React from "react";

export default class ImageChatMessage extends ChatMessage {
    constructor(url, ...args) {
        super(...args);
        this._url = url;

        if (this.saveContent) {
            this.save();
        }
    }

    static instanceFromDictionary(dic) {
        return new ImageChatMessage(dic.url, dic.direction, dic.receiver, false, dic.sent, dic.datetime, dic.createdTimestamp, dic.id);
    }

    getComponentToRender(key) {
        return (
            <MessageBox key={key}
                        direction={this.direction}
                        text={this.text}
                        datetime={this.datetime}
                        sent={this.sent}
                        content={<ImageContent key={key} url={this.url}/>}
            />
        );
    }

    sendMessageViaWebSocket(ws) {
        // if (ws.readyState === WebSocket.OPEN) {
        //     ws.send(JSON.stringify({
        //         type: 'message',
        //         text: this.text,
        //         receiver: this.receiver,
        //         created_timestamp: this.createdTimestamp,
        //     }));
        // }
    }

    getDictionary() {
        return {
            ...super.getDictionary(),
            url: this._url,
            type: messageType.IMAGE
        };
    }

    get url() {
        return this._url;
    }

}