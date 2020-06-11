import {
    ADD_MATCH, SET_MATCHESLIST,
} from "../actions/Types";
import MatchesList from "../../match/classes/MatchesList";
import ChatsList from "../../chat/classes/ChatsList";

function matchReducer(state = {}, action) {
    // TODO: change access to private data member
    const matchesInfo = state.matchesList ? state.matchesList._matchesInfo : null;
    switch (action.type) {
        case ADD_MATCH:
            let matched_with = action.payload.match;
            let newMatchesList =
                new MatchesList({
                    ...matchesInfo,
                    [matched_with]: matched_with
                }, true);
            console.log("in add match reducer ", newMatchesList);
            return {
                ...state,
                matchesList: newMatchesList
            }
        case SET_MATCHESLIST:

            if (!action.payload.matches) {
                return state;
            }

            return {
                ...state,
                matchesList: new MatchesList(action.payload.matches, !action.payload.isRetrieve)
            };
        default:
            return state
    }
}
export default matchReducer;