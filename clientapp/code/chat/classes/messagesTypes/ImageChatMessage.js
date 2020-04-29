import ChatMessage from "./ChatMessage";
import {messageType, messageTypesForServer} from "./ChatMessageTypes";
import {ImageContent, MessageBox} from "../../components/MessageBox";
import React from "react";
import * as FileSystem from "expo-file-system";


export default class ImageChatMessage extends ChatMessage {
    constructor(imageExtension, base64Content, ...args) {
        super(...args);

        this._imageExtension = imageExtension;
        this._base64Content = base64Content;
        this._dir = FileSystem.cacheDirectory + "chat/chatImageMessages";
        this._path = this.dir + "/" + this.getUniqueKey() + "." + this.imageExtension;

        if (this.saveContent) {
            this.save();
        }
    }

    static instanceFromDictionary(dic) {
        return new ImageChatMessage(dic.imageExtension, "", dic.direction, dic.receiver,
            false, dic.sent, dic.datetime, dic.createdTimestamp, dic.id, dic.seen);
    }

    getComponentToRender(key) {
        return (
            <MessageBox key={key}
                        direction={this.direction}
                        text={this.text}
                        datetime={this.datetime}
                        sent={this.sent}
                        seen={this.seen}
                        content={<ImageContent key={key}
                                               url={`data:image/${this.imageExtension};base64,${this.base64Content}`}/>}
            />
        );
    }

    save() {
        super.save();

        // Save Image to cache
        FileSystem.makeDirectoryAsync(this.dir, {intermediates: true})
            .then(res => {
                    console.log("Created cache dir for chat images", res);
                    FileSystem.writeAsStringAsync(this.path, this.base64Content, {encoding: FileSystem.EncodingType.Base64})
                        .then(res => console.log("Saved Image for Image message in cache", res))
                        .catch(err => console.log("Could not save image for image message in cache", err));
                }
            )
            .catch(error => {
                    console.log("Could not create directory to save chat image", error);
                }
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
            }));
        }
    }

    getDictionary() {
        return {
            ...super.getDictionary(),
            imageExtension: this.imageExtension,
            type: messageType.IMAGE
        };
    }

    get imageExtension() {
        return this._imageExtension;
    }

    get base64Content() {
        return this._base64Content;
    }

    get path() {
        return this._path;
    }

    set base64Content(value) {
        this._base64Content = value;
    }

    get dir() {
        return this._dir;
    }
}