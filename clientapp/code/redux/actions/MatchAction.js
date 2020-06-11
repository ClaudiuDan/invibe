import MatchesList from "../../match/classes/MatchesList";
import {ADD_MATCH, SET_MATCHESLIST} from "./Types";


export const retrieveMatchesList = () => dispatch => {
    MatchesList.retrieve().then(matches => {
            dispatch({
                type: SET_MATCHESLIST,
                payload: {
                    matches: matches,
                    isRetrieve: true,
                }
            })
        }
    ).catch(
        err => console.log("Error in matchesList retrieve action", err)
    );
};

export const addMatch = (matched_with) => {
    return {
        type: ADD_MATCH,
        payload: {
            match: matched_with,
        }
    };
};