import ChatMessage from "./ChatMessage";
import {messageType, messageTypesForServer} from "./ChatMessageTypes";
import {ImageContent, MessageBox} from "../../components/MessageBox";
import React from "react";

export default class ImageChatMessage extends ChatMessage {
    constructor(imageExtension, base64Content, ...args) {
        super(...args);

        if (this.saveContent) {
            this.save();
        }
        this._imageExtension = imageExtension;
        this._base64Content = base64Content;
    }

    static instanceFromDictionary(dic) {
        return new ImageChatMessage(dic.imageExtension, dic.base64Content, dic.direction, dic.receiver,
            false, dic.sent, dic.datetime, dic.createdTimestamp, dic.id);
    }

    getComponentToRender(key) {
        return (
            <MessageBox key={key}
                        direction={this.direction}
                        text={this.text}
                        datetime={this.datetime}
                        sent={this.sent}
                        content={<ImageContent key={key}
                                               url={`data:image/${this.imageExtension};base64,${this.base64Content}`}/>}
            />
        );
    }

    sendMessageViaWebSocket(ws) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'message',  // Specific for the websocket connection with the server
                message_type: messageTypesForServer.IMAGE_MESSAGE,
                receiver: this.receiver,
                created_timestamp: this.createdTimestamp,
                image_extension: this.imageExtension,
                base64_content: this.base64Content,
            }));
        }
    }

    //TODO: consider isolating the base64content under another key and lazy load the image(i.e. load message body and retrieve image content later
    getDictionary() {
        return {
            ...super.getDictionary(),
            imageExtension: this._imageExtension,
            base64Content: this._base64Content,
            type: messageType.IMAGE
        };
    }

    get imageExtension() {
        return this._imageExtension;
    }

    get base64Content() {
        return this._base64Content;
    }
}