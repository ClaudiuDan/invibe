import {RESTORE_TOKEN, RESTORE_USERID, SIGN_IN, SIGN_OUT} from "../actions/Types";

function authReducer(state = {}, action) {
    switch (action.type) {
        case SIGN_IN:
            return {
                ...state,
                userToken: action.payload.token,
                userId: action.payload.userId,
            };

        case SIGN_OUT:
            return {
                ...state,
                userToken: null,
            };

        case RESTORE_TOKEN:
            return {
                ...state,
                userToken: action.payload.token,
                isLoading: false,
            };

        case RESTORE_USERID:
            return {
                ...state,
                userId: action.payload.userId,
            };

        default:
            return state;
    }
}

export default authReducer