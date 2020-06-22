import MatchesList from "../../match/classes/MatchesList";
import {ADD_MATCH, SET_MATCHESLIST_LOCAL, SET_MATCHESLIST_DIFF, SET_MATCHESLIST_SERVER} from "./Types";
import Axios from "axios";

const getMatchesListFromServer = async () => {
    const res = await Axios
        .get(`/matches/`)
        .then(response => {
            return JSON.parse(response.data)
        })
        .catch(error => {
            console.log(error)
            return null
        })
    return res;
};

const getMatchesListFromLocal = async () => {
    const res = await MatchesList.retrieve()
    return res
};

export const getMatchesList = () => dispatch => {
    getMatchesListFromLocal()
        .then(retrievedMatches => {
            getMatchesListFromServer()
                .then(matchesFromServer => {
                    MatchesList.delete()
                        .then( () => {
                            dispatch(setMatchesListServer(matchesFromServer, retrievedMatches))
                        })
                        .catch( error => {
                            console.log("Could not set matcheslist from server", error)
                            return state
                        })
                })
                .catch(err => {
                    console.log ("Could not retrieve matches from server", error)
                    dispatch(setMatchesListLocal(match))
                })
        })
        .catch(error => {
            console.log ("Could not retrieve local matches", error)
            getMatchesListFromServer()
                .then(matchesFromServer => {
                    dispatch(setMatchesListServer(matchesFromServer))
                })
                .catch(error => {
                    console.log ("Could not retrieve matches from server either", error)
                })
        })
};

const setMatchesListLocal = (matches) => {
    return {
        type: SET_MATCHESLIST_LOCAL,
        payload: {
            matches: matches
        }
    }
}

const setMatchesListServer = (matches) => {
    return {
        type: SET_MATCHESLIST_SERVER,
        payload: {
            matches: matches
        }
    }
}

const setMatchesListDiff = (matches) => {
    return {
        type: SET_MATCHESLIST_DIFF,
        payload: {
            matches: matchesFromServer,
            retrievedMatches: retrievedMatches
        }
    }
}

export const addMatch = (matched_with) => {
    return {
        type: ADD_MATCH,
        payload: {
            match: matched_with,
        }
    };
};