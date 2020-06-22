import {
    ADD_MATCH, SET_MATCHESLIST_DIFF, SET_MATCHESLIST_LOCAL, SET_MATCHESLIST_SERVER,
} from "../actions/Types";
import MatchesList from "../../match/classes/MatchesList";
import MatchInfo from "../../match/classes/MatchInfo";
function matchReducer(state = {}, action) {
    const matchesInfo = state.matchesList ? state.matchesList.matchesInfo : null;
    switch (action.type) {
        case ADD_MATCH: {
            const receiver = action.payload.match;
            let newMatchesList =
                new MatchesList({
                    ...matchesInfo,
                    [receiver]: new MatchInfo(receiver)
                }, true);
            return {
                ...state,
                matchesList: newMatchesList
            }
        }
        case SET_MATCHESLIST_LOCAL:
            return {
                ...state,
                matchesList: new MatchesList(action.payload.matches, false)
            };
        case SET_MATCHESLIST_SERVER:
            let newMatchesList = {}
            for (const receiver in action.payload.matches) {
                newMatchesList[receiver] = new MatchInfo(receiver)
                newMatchesList[receiver].save()
            }
            return {
                ...state,
                matchesList: new MatchesList(newMatchesList, true)
            }
        default:
            return state
    }
}

function checkDiff(list, retrievedMatchesInfo) {
    if (retrievedMatchesInfo == {}) {
        return true;
    }
    console.log("aici", list, retrievedMatchesInfo);
    for (const receiver in list) {
        console.log("in check diff", receiver)
        if (!(receiver in retrievedMatchesInfo))
            return true;
    }

    return false;
}

function saveDiff (list, retrievedMatchesInfo) {
    let diff = {}
    for (const receiver in list) {
        if (!(receiver in retrievedMatchesInfo))
            diff[receiver] = new MatchInfo(receiver, true)
    }
    return diff
}
export default matchReducer;