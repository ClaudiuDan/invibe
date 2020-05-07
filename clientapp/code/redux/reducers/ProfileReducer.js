import {UPDATE_USER_PROFILE} from "../actions/Types";
import UserProfile from "../../profile/UserProfile";

function profileReducer(state = {}, action) {
    switch (action.type) {

        case UPDATE_USER_PROFILE:
            // Verify if profile is in store; if not, create one
            const userId = action.payload.userId;
            const profile = userId in state.profiles ? state.profiles[userId] : new UserProfile(userId);

            if ("name" in action.payload) {
                profile.name = action.payload.name;
            }

            if ("shortDescription" in action.payload) {
                profile.shortDescription = action.payload.shortDescription;
            }

            if ("longDescription" in action.payload) {
                profile.longDescription = action.payload.longDescription;
            }

            if ("profileImage" in action.payload) {
                profile.profileImage = action.payload.profileImage;
            }

            if ("albumImages" in action.payload) {
                profile.albumImages = action.payload.albumImages;
            }

            if ("status" in action.payload) {
                profile.status = action.payload.status;
            }

            if ("albumStatus" in action.payload) {
                profile.albumStatus = action.payload.albumStatus;
            }

            if ("gender" in action.payload) {
                profile.gender = action.payload.gender;
            }

            return {
                ...state,
                profiles: {...state.profiles, [userId]: profile.shallowCopy()}
            }

        default:
            return state;
    }
}

export default profileReducer