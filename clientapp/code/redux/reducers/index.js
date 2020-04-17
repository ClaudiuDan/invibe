import  {combineReducers} from "redux";
import authReducer from './AuthReducer'
import chatReducer from "./ChatReducer";

export default combineReducers({
    auth: authReducer,
    chat: chatReducer,
})