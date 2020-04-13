import React, {Component} from 'react';
import {Text} from 'react-native'

class U2UChatScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userId:  this.props.route.params.userId,
        }
    }

    render() {
        console.log(this.state.userId)
        return (
            <Text> {this.state.userId}</Text>
        );
    }
}

export default U2UChatScreen;
