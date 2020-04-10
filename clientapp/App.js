import React, {Component} from 'react';
import Axios from 'axios';
import {Provider} from 'react-redux'
import store from './code/redux/Store'
import Main from "./Main";

class App extends Component {

    constructor(props) {
        super(props)

        Axios.defaults.baseURL = 'https://invibes.herokuapp.com/';
        Axios.defaults.xsrfHeaderName = "x-csrftoken";
        Axios.defaults.xsrfCookieName = "XSRF-TOKEN";
        Axios.defaults.timeout = 1500;
    }

    render() {
        return (
            <Provider store={store}>
                <Main />
            </Provider>
        )
    }
}

export default App;