import React, { Component } from 'react';
import {
    ScrollView,
    TextInput,
    View,
    Button
} from 'react-native';
import {connect} from 'react-redux';
import {signIn} from "../redux/actions/AuthAction";
import {socialRegister} from "../redux/actions/AuthAction";
import {handleFacebookSocialRequest} from "../Utils/SocialUtils"
import {Text} from "react-native";

class LoginScreen extends Component {

  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
    }
  }

  onEmailChange(text) {
    this.setState({ email: text });
  }

  onPasswordChange(text) {
    this.setState({ password: text });
  }

  handleRequest = () => {
      this.props.signIn(this.state.email, this.state.password);
  }

  get = () => {
    this.props.signIn(this.state.email, this.state.password);
  }

  render() {
    return (
      <ScrollView style={{padding: 20}}>
        <TextInput
          placeholder='Email'
          onChangeText={this.onEmailChange.bind(this)}
        />
        <TextInput
          placeholder='Password'
          onChangeText={this.onPasswordChange.bind(this)}
        />
        <View style={{margin:7}} />
          <Button
            onPress={this.handleRequest.bind(this)}
            title="Login"
          />
          <Text style={{color: 'blue', fontSize: 17}}
                onPress={() => this.props.navigation.navigate('Register')}>
              Register
          </Text>
          <Button
            onPress={() => handleFacebookSocialRequest(this.props.socialRegister)}
            title="Facebook login"
          />
      </ScrollView>
    )
  }
}

// am uitat ce facea connectu asta
export default connect(null, {signIn, socialRegister})(LoginScreen);

// const LOGIN_REQ_LINK = "https://google.com";
// const OK_STATUS = 200
// async function facebookLogin(navigation) {
//     try {
//         const response = await fetch(LOGIN_REQ_LINK);
//         if (response.status == OK_STATUS) {
//             navigation.navigate('Home');
//         }
//         console.log(response.status);
//         // navigation.navigate('Home');
//     }
//     catch (error) {
//         console.error(error);
//     }
// }
