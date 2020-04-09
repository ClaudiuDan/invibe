import {SIGN_IN, SIGN_OUT, RESTORE_TOKEN} from "../actions/Types";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const signIn = (email, password) => dispatch => {
    // Intentional use of username in the axios request
    axios
        .post(`/auth/login/`, {username: email, password: password})
        .then(response => {
            console.log(response.data)
            const {token, user} = response.data;

            // We set the returned token as the default authorization header
            axios.defaults.headers.common.Authorization = `Token ${token}`;

            SecureStore.setItemAsync('userToken', token)
                .catch((err => console.log("Could not save the auth token.", err)));

            dispatch({
                type: SIGN_IN,
                payload: {
                    token: token,
                    user: user,
                }
            })
        })
        .catch(error => console.log(error));
};


export const register = (email, password) => dispatch => {
    axios
        .post(`/auth/register/`, {email: email, password: password})
        .then(response => {
            const {token, user} = response.data;

            // We set the returned token as the default authorization header
            axios.defaults.headers.common.Authorization = `Token ${token}`;

            SecureStore.setItemAsync('userToken', token)
                .catch((err => console.log("Could not save the auth token.", err)));

            dispatch({
                type: SIGN_IN,
                payload: {
                    token: token,
                    user: user,
                }
            })
        })
        .catch(error => console.log(error));
};

export const signOut = () => dispatch => {
    axios
        .get(`/auth/logout/`)
        .then(response => {
            axios.defaults.headers.common.Authorization = null;
            SecureStore.deleteItemAsync('userToken')
                .catch(err => console.log("Could not delete the auth token.", err));
            dispatch({
                type: SIGN_OUT,
            })
        })
        .catch(error => console.log(error));
};

export const restoreToken = () => dispatch => {
    SecureStore.getItemAsync('userToken')
        .then(token => {
            // We set the returned token as the default authorization header
            axios.defaults.headers.common.Authorization = `Token ${token}`;

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
