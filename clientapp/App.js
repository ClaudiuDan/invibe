import React, {Component} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {Text} from 'react-native';
//how do you restrict visibility of components?
import { HomeScreen, ChatsScreen, LoginScreen,
         ProfileScreen, SettingsScreen } from './code/screens/exports.js';
import axios from 'axios';

class App extends Component {

  constructor(props) {
    super(props)

    axios.defaults.baseURL = 'https://invibes.herokuapp.com/';
    axios.defaults.timeout = 1500;

    state = {
      isLoading : false,
      userToken : null,
    }
  }

  render() {
    if (state.isLoading) {
      // We haven't finished checking for the token yet
      return (<Text>Loading</Text>);
    }
    const Stack = createStackNavigator();
    return (
      <NavigationContainer>
        <Stack.Navigator>
          {state.userToken == null ? (
              <Stack.Screen name = "Login" component = {LoginScreen} />
          ) : (
            <>
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{title: 'Welcome'}}
              />
              <Stack.Screen name = "Profile" component = {ProfileScreen} />
              <Stack.Screen name = "Chats" component = {ChatsScreen} />
              <Stack.Screen name = "Settings" component = {SettingsScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    )
  }
}

export default App;
