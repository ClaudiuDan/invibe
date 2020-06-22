import {retrieveFromLocalStorage, saveToLocalStorage} from "../../Utils/Utils";
import MatchInfo from "./MatchInfo";
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
        const keysDic = {...this.matchesInfo};

        // individual matches need to be saved locally too
        for (const receiver in keysDic) {
            keysDic[receiver] = keysDic[receiver].getUniqueKey();
        }
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
        const res = {}
        for (const receiver in value) {
            // is this necessary?
            if (value[receiver]) {
                const matchInfo =  await MatchInfo.retrieve(value[receiver]);
                if (matchInfo) {
                    res[receiver] = matchInfo;
                }
            }
        }

        return res;
    }

    static async delete () {
        const value = await retrieveFromLocalStorage(
            MatchesList.getUniqueKey(),
            "Could not retrieve matchestList from local storage."
        );
        if (!value) {
            return {};
        }
        console.log(value)
        for (const receiver in value) {
            if (value[receiver]) {
                console.log(value[receiver])
                await MatchInfo.deleteItem(value[receiver])
            }
        }
    }

    get matchesInfo() {
        return this._matchesInfo;
    }
}

