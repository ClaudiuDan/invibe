import React, {Component} from 'react';
import axios from 'axios';
import {connect, Provider} from 'react-redux'
import store from './code/redux/Store'
import Main from "./Main";

class App extends Component {

    constructor(props) {
        super(props)

        axios.defaults.baseURL = 'https://invibes.herokuapp.com/';
        axios.defaults.timeout = 1500;
    }

    render() {
        return (
            <Provider store={store}>
                <Main/>
            </Provider>
        )
    }
}

export default App;