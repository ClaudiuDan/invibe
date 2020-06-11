import  {combineReducers} from "redux";
import authReducer from './AuthReducer'
import chatReducer from "./ChatReducer";
import profileReducer from "./ProfileReducer";
import matchReducer from "./MatchReducer";

export default combineReducers({
    auth: authReducer,
    chat: chatReducer,
    profile: profileReducer,
    match: matchReducer,
})