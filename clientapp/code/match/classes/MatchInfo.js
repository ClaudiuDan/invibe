import {retrieveFromLocalStorage, saveToLocalStorage} from "../../Utils/Utils";

export default class MatchInfo {

    constructor(receiver, saveContent = true, ord = 0) {
        this._receiver = receiver.toString();
        this._ord = ord;
        if (saveContent) {
            this.save();
        }
        this._receiver = receiver;
    }
    getUniqueKey() {
        return "matchInfo-" + this._receiver;
    }

    save() {
        saveToLocalStorage(
            this.getUniqueKey(),
            this.getDictionary(),
            "Could not save chat info with unique key " + this.getUniqueKey() + " to local storage."
        );
    }
    static instanceFromDic(dic) {
        return new MatchInfo(dic.receiver, false, dic.ord);
    }
    static async retrieve(key) {
        const value = await retrieveFromLocalStorage(
            key,
            "Could not retrieve chat info with unique key " + key + " from local storage."
        );

        if (!value) {
            return null;
        }
        return MatchInfo.instanceFromDic(value);
    }

    getDictionary() {
        return {
            receiver: this._receiver,
            ord: this._ord,
        }
    }

    get receiver() {
        return this._receiver;
    }
}