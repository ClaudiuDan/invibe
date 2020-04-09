import {SIGN_IN, SIGN_OUT, RESTORE_TOKEN} from "../actions/Types";

function authReducer(state = {}, action) {
    switch (action.type) {
        case SIGN_IN:
            return {
                ...state,
                userToken: action.payload.token,
            }
        default:
            return state;
    }
}
export default authReducer