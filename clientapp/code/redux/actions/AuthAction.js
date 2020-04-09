import {SIGN_IN, SIGN_OUT, RESTORE_TOKEN} from "../actions/Types";
import axios from "axios";

export const signIn = (email, password) => dispatch => {
    // Intentional use of username in the axios request
    axios
        .post(`/auth/login/`, {username: email, password: password})
        .then(response => {
            const {token, user} = response.data;

            // We set the returned token as the default authorization header
            axios.defaults.headers.common.Authorization = `Token ${token}`;

            dispatch({
                type: SIGN_IN,
                payload: {
                    token: token,
                    user: user,
                }
            })
        })
        .catch(error => console.log(error));
}

export const signOut = () => dispatch => {
    axios
        .get(`/auth/logout/`)
        .then(response => {
            console.log(response)
            dispatch({
                type: SIGN_OUT,
            })
        })
        .catch(error => console.log(error));
}
