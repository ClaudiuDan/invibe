import {retrieveFromLocalStorage, saveToLocalStorage} from "../../Utils/Utils";
import {retrieveMessage} from "../../Utils/ChatUtils";

export default class ChatInfo {
    constructor(receiver, id, saveContent = true, ord = 0, messagesKeys = [], messages = []) {
        this._receiver = receiver.toString();
        this._id = id;
        this._messagesKeys = messagesKeys;
        this._messages = messages;
        this._ord = ord;
        if (saveContent) {
            this.save();
        }
    }
    static getMessageKeysFromMessages(messages) {
        return messages.map(msg => msg.getUniqueKey());
    }

    static instanceFromDic(dic) {
        return new ChatInfo(dic.receiver, dic.id, false, dic.ord, dic.messagesKeys);
    }

    updateMessage(newMessage) {
        const index = this.messages.findIndex(msg => {
            return msg.getUniqueKey() === newMessage.getUniqueKey()
        });
        if (index === -1) {
            return this;
        }

        return new ChatInfo(
            this.receiver,
            this.id,
            false,
            this.ord,
            this.messagesKeys,
            [...this.messages.slice(0, index), newMessage, ...this.messages.slice(index + 1)]
        );
    }

    markMessagesAsRead(upToCreatedDatetime, direction) {
        this.messages.forEach(msg => {
            if (msg.direction === direction && msg.createdTimestamp <= upToCreatedDatetime) {
                msg.seen = true;
                msg.save();
            }
        });

        return new ChatInfo(
            this.receiver,
            this.id,
            false,
            this.ord,
            this.messagesKeys,
            this.messages,
        );
    }

    async retrieveMessages() {
        const messages = [];
        for (const msgKey of this.messagesKeys) {
            const message = await retrieveMessage(msgKey);
            if (message) {
                messages.push(message)
            }
        }
        return messages;
    }

    isEqual(chatInfo) {
        if (!chatInfo) {
            return false;
        }

        return this.getUniqueKey() === chatInfo.getUniqueKey();
    }

    getUniqueKey() {
        return "chatInfo-" + this._receiver;
    }

    save() {
        saveToLocalStorage(
            this.getUniqueKey(),
            this.getDictionary(),
            "Could not save chat info with unique key " + this.getUniqueKey() + " to local storage."
        );
    }

    static async retrieve(key) {
        const value = await retrieveFromLocalStorage(
            key,
            "Could not retrieve chat info with unique key " + key + " from local storage."
        );

        if (!value) {
            return null;
        }

        return ChatInfo.instanceFromDic(value);
    }

    getDictionary() {
        return {
            receiver: this._receiver,
            id: this._id,
            ord: this._ord,
            messagesKeys: this._messagesKeys
        }
    }

    // Getters and Setters
    get messagesKeys() {
        return this._messagesKeys;
    }

    get id() {
        return this._id;
    }

    get messages() {
        return this._messages;
    }

    get ord() {
        return this._ord;
    }

    get receiver() {
        return this._receiver;
    }

    set messagesKeys(value) {
        this._messagesKeys = value;
    }

    set messages(value) {
        this._messages = value;
    }
}

export const ChatInfoStatus = {
  UNLOADED: "UNLOADED",
  LOADING: "LOADING",
  LOADED: "LOADED"
};