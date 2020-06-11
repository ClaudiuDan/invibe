import {retrieveFromLocalStorage, saveToLocalStorage} from "../../Utils/Utils";
import ChatInfo from "../../chat/classes/ChatInfo";
export default class MatchesList {
    // TODO: a lot of duplicate code for retrieving/storing, maybe we can do better
    constructor(matchesInfo = {}, saveContent = false) {
        this._matchesInfo = matchesInfo
        if (saveContent) {
            this.save();
        }
    }

    static getUniqueKey() {
        return "matchesList";
    }

    save() {
        const keysDic = {...this._matchesInfo};

        saveToLocalStorage(
            MatchesList.getUniqueKey(),
            keysDic,
            "Could not save matchesList to local storage."
        );
    }

    static async retrieve() {
        const value = await retrieveFromLocalStorage(
            MatchesList.getUniqueKey(),
            "Could not retrieve matchestList from local storage."
        );

        if (!value) {
            return {};
        }

        return value;
    }
}

