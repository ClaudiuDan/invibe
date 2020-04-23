import ChatMessage from "./ChatMessage";
import {messageType} from "./ChatMessageTypes";
import {MessageBox, TextContent} from "../components/MessageBox";
import React from "react";

export default class TextChatMessage extends ChatMessage {
    constructor(text, ...args) {
        super(...args);
        this._text = text;
    }

    static instanceFromDictionary(dic) {
        return new TextChatMessage(dic.text, dic.direction, dic.receiver, dic.sent, dic.datetime, dic.createdTimestamp, dic.id);
    }

    getComponentToRender(key) {
        return (
            <MessageBox key={key}
                        direction={this.direction}
                        text={this.text}
                        datetime={this.datetime}
                        sent={this.sent}
                        content={<TextContent text={this.text} direction={this.direction}/>}
            />
        );
    }

    getDictionary() {
        return {
            ...super.getDictionary(),
            text: this._text,
            type: messageType.TEXT
        };
    }

    get text() {
        return this._text;
    }

}