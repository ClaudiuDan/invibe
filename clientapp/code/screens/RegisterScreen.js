import React, { Component } from 'react';
import {
    ScrollView,
    TextInput,
    View,
    Button
} from 'react-native';
import {connect} from 'react-redux';
import {register} from "../redux/actions/AuthAction";

class RegisterScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            email: '',
            password: '',
            confirmedPassword: '',
        }
    }

    onEmailChange(text) {
        this.setState({ email: text });
    }

    onPasswordChange(text) {
        this.setState({ password: text });
    }

    onConfirmedPasswordChange(text) {
        this.setState({ confirmedPassword: text });
    }

    handleRequest = () => {
        this.props.register(this.state.email, this.state.password);
    };

    render() {
        return (
            <ScrollView style={{padding: 20}}>
                <TextInput
                    placeholder='Email'
                    onChangeText={this.onEmailChange.bind(this)}
                />
                <TextInput
                    placeholder='Password'
                    secureTextEntry={true}
                    onChangeText={this.onPasswordChange.bind(this)}
                />
                <TextInput
                    placeholder='Confirm Password'
                    secureTextEntry={true}
                    onChangeText={this.onConfirmedPasswordChange.bind(this)}
                />
                <View style={{margin:7}} />
                <Button
                    onPress={this.handleRequest.bind(this)}
                    title="Register"
                />
            </ScrollView>
        )
    }
}

export default connect(null, {register})(RegisterScreen);
