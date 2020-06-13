import {
    ADD_MATCH, SET_MATCHESLIST,
} from "../actions/Types";
import MatchesList from "../../match/classes/MatchesList";
import MatchInfo from "../../match/classes/MatchInfo";
function matchReducer(state = {}, action) {
    const matchesInfo = state.matchesList ? state.matchesList.matchesInfo : null;
    switch (action.type) {
        case ADD_MATCH:
            let receiver = action.payload.match;
            let newMatchesList =
                new MatchesList({
                    ...matchesInfo,
                    [receiver]: new MatchInfo(receiver)
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