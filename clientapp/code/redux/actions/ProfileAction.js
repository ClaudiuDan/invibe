import Axios from "axios";
import {UPDATE_USER_PROFILE} from "./Types";
import {profileStatus} from "../../profile/ProfileStatus";
import PROFILE_IMAGE_PLACEHOLDER from "../../../assets/profile-image-placeholder.png";

// TODO: Consider adding caching to this
export const getProfile = (userId, withAlbumImages = false) => dispatch => {
    console.log("GET CHAT FOR ", userId);
    let albumStatus = withAlbumImages ? profileStatus.LOADING : profileStatus.UNLOADED;
    dispatch({
        type: UPDATE_USER_PROFILE,
        payload: {
            userId: userId,
            status: profileStatus.LOADING,
            albumStatus: albumStatus,
        }
    })

    Axios
        .get(`/profile/`, {params: {user_id: userId, with_album_images: withAlbumImages}})
        .then(response => {
            const parsedData = JSON.parse(response.data);

            const profileImage = "profile_image" in parsedData ?
                {uri: `data:image/${parsedData.profile_image_extension};base64,${parsedData.profile_image}`} :
                PROFILE_IMAGE_PLACEHOLDER;

            const albumImages = parsedData.album_images.map(image => {
                return {
                    uri: `data:image/${image.image_extension};base64,${image.image}`,
                    createdTimestamp: image.created_timestamp,
                };
            });

            albumStatus = withAlbumImages ? profileStatus.LOADED : profileStatus.UNLOADED;

            dispatch({
                type: UPDATE_USER_PROFILE,
                payload: {
                    userId: userId,
                    status: profileStatus.LOADED,
                    name: parsedData.name,
                    shortDescription: parsedData.short_description,
                    longDescription: parsedData.long_description,
                    profileImage: profileImage,
                    albumImages: albumImages,
                    albumStatus: albumStatus,
                }
            })

        })
        .catch(error => {
            console.log("Could not get user profile from server", userId, error);
            dispatch({
                type: UPDATE_USER_PROFILE,
                payload: {
                    userId: userId,
                    status: profileStatus.ERROR,
                    albumStatus: profileStatus.ERROR,
                }
            })
        });
}

export const getProfileAlbumImages = (userId) => dispatch => {

    dispatch({
        type: UPDATE_USER_PROFILE,
        payload: {
            userId: userId,
            albumStatus: profileStatus.LOADING,
        }
    })

    Axios
        .get(`/profile/album_images/`, {params: {user_id: userId}})
        .then(response => {
            const parsedData = JSON.parse(response.data);

            const albumImages = parsedData.map(image => {
                return {
                    uri: `data:image/${image.image_extension};base64,${image.image}`,
                    createdTimestamp: image.created_timestamp,
                };
            });

            dispatch({
                type: UPDATE_USER_PROFILE,
                payload: {
                    userId: userId,
                    albumImages: albumImages,
                    albumStatus: profileStatus.LOADED,
                }
            })

        })
        .catch(error => {
            console.log("Could not get user profile album images from server", userId, error);
            dispatch({
                type: UPDATE_USER_PROFILE,
                payload: {
                    userId: userId,
                    albumStatus: profileStatus.ERROR,
                }
            })
        });
}

export const updateProfile = (userId, changes, profileAfterChanges) => dispatch => {

    dispatch({
        type: UPDATE_USER_PROFILE,
        payload: {
            userId: userId,
            albumStatus: profileStatus.SAVING,
        }
    })

    Axios
        .post(`/profile/`, changes)
        .then(_ => {
            dispatch({
                type: UPDATE_USER_PROFILE,
                payload: {
                    userId: userId,
                    status: profileStatus.LOADED,
                    ...profileAfterChanges,
                }
            })
        }).catch(error => {
        console.log("Could not save the profile changes", error);
        dispatch({
            type: UPDATE_USER_PROFILE,
            payload: {
                userId: userId,
                albumStatus: profileStatus.SAVING_ERRORED,
            }
        })
    });
}

export const updateProfileStatus = (userId, status) => dispatch => {
    dispatch({
        type: UPDATE_USER_PROFILE,
        payload: {
            userId: userId,
            status: status,
        }
    });
}