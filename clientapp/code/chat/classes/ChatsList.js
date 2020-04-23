import {retrieveFromLocalStorage, saveToLocalStorage} from "../../Utils/Utils";
import ChatInfo from "./ChatInfo";

export default class ChatsList {
    constructor(chatsInfo = {}) {
        this._chatsInfo = chatsInfo;
        this._maxOrd = this.getMaxOrd();
        this.save();
    }

    getMaxOrd() {
        let max = -1;
        for (const receiver in this.chatsInfo) {
            max = Math.max(this.chatsInfo[receiver].ord, max);
        }
        return max;
    }

    static getUniqueKey() {
        return "chatsList";
    }

    save() {
        const keysDic = {...this.chatsInfo};
        for (const receiver in keysDic) {
            keysDic[receiver] = keysDic[receiver].getUniqueKey();
        }

        saveToLocalStorage(
            ChatsList.getUniqueKey(),
            keysDic,
            "Could not save chatslist to local storage."
        );
    }

    static async retrieve() {
        const value = await retrieveFromLocalStorage(
            ChatsList.getUniqueKey(),
            "Could not retrieve chatslist from local storage."
        );

        if (!value) {
            return {};
        }

        for (const receiver in value) {
            value[receiver] = await ChatInfo.retrieve(value[receiver]);
        }

        return value;
    }

    get chatsInfo() {
        return this._chatsInfo;
    }

    get maxOrd() {
        return this._maxOrd;
    }
}