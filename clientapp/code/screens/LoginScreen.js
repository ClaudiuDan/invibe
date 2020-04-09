import React, { Component } from 'react';
import {
    ScrollView,
    Text,
    TextInput,
    View,
    Button
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

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
   axios
    .post(`/auth/login/`, {username: this.state.email, password: this.state.password } )
    .then(response => {
      const { token, user } = response.data;

      // We set the returned token as the default authorization header
      axios.defaults.headers.common.Authorization = `Token ${token}`;

      // Navigate to the home screen
      console.log(token)
      // navigation.navigate('Home');
      // const navigation = useNavigation();
    })
    .catch(error => console.log(error));
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
            title="Submit"
          />
      </ScrollView>
    )
  }
}

export default LoginScreen;

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
