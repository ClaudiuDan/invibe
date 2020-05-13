import {RESTORE_TOKEN, SIGN_IN, SIGN_OUT} from "../actions/Types";
import Axios from "axios";
import * as SecureStore from "expo-secure-store";
import {RESTORE_USERID} from "./Types";

export const signIn = (email, password) => dispatch => {
    // Intentional use of username in the axios request
    Axios
        .post(`/auth/login/`, {username: email, password: password})
        .then(response => {
            const {token, userId} = response.data;

            // We set the returned token as the default authorization header
            Axios.defaults.headers.common.Authorization = `Token ${token}`;

            saveTokenAndUserIdToSecureStorage(token, userId);

            dispatch({
                type: SIGN_IN,
                payload: {
                    token: token,
                    userId: userId,
                }
            })
        })
        .catch(error => console.log(error));
};

export const register = (email, password) => dispatch => {
    Axios
        .post(`/auth/register/`, {email: email, password: password})
        .then(response => {
            const {token, userId} = response.data;

            // We set the returned token as the default authorization header
            Axios.defaults.headers.common.Authorization = `Token ${token}`;

            saveTokenAndUserIdToSecureStorage(token, userId);

            dispatch({
                type: SIGN_IN,
                payload: {
                    token: token,
                    userId: userId,
                }
            })
        })
        .catch(error => console.log(error));
};


export const socialRegister = (token) => dispatch => {
    Axios
        .post(`/auth/rest-auth/facebook/`, {access_token: token})
        .then(response => {
            const {key, userId} = response.data;
            Axios.defaults.headers.common.Authorization = `Token ${key}`;

            saveTokenAndUserIdToSecureStorage(token, userId);

            dispatch({
                type: SIGN_IN,
                payload: {
                    token: key,
                    userId: userId,
                }
            })
        })
        .catch(error => console.log(error));
};


export const socialConnect = (token) => dispatch => {
    Axios
        .post(`/auth/rest-auth/facebook/connect/`, {access_token: token})
        .then(response => {
            console.log(response.status);
        })
        .catch(error => console.log(error));
};

export const signOut = () => dispatch => {
    //TODO: remove data stored in cache
    Axios.get(`/auth/logout/`).catch(error => console.log(error));

    delete Axios.defaults.headers.common.Authorization;

    SecureStore.deleteItemAsync('userToken')
        .catch(err => console.log("Could not delete the auth token.", err));
    SecureStore.deleteItemAsync('userId')
        .catch(err => console.log("Could not delete the userId", err));

    dispatch({
        type: SIGN_OUT,
    })
};

export const restoreToken = () => dispatch => {
    SecureStore.getItemAsync('userToken')
        .then(token => {
            // We set the returned token as the default authorization header
            if (token) {
                Axios.defaults.headers.common.Authorization = `Token ${token}`;
            }

            dispatch({
                type: RESTORE_TOKEN,
                payload: {
                    token: token,
                }
            })
        })
        .catch(err => dispatch({
            type: RESTORE_TOKEN,
            payload: {
                token: null,
            }
        }))
};

export const restoreUserId = () => dispatch => {
    SecureStore.getItemAsync('userId')
        .then(userId => {
            dispatch({
                type: RESTORE_USERID,
                payload: {
                    userId: userId,
                }
            })
        })
        .catch(err => console.log('Could not restore userId', err))
};

function saveTokenAndUserIdToSecureStorage(token, userId) {
    SecureStore.setItemAsync('userToken', token)
        .catch((err => console.log("Could not save the auth token.", err)));
    SecureStore.setItemAsync('userId', userId.toString())
        .catch((err => console.log("Could not save the auth userId.", err)));
}
