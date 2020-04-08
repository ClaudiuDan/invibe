import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
//how do you restrict visibility of components? 
import { HomeScreen, ChatsScreen, LoginScreen,
         ProfileScreen, SettingsScreen } from './code/screens/exports.js';
const Stack = createStackNavigator();

export default function MyStack() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name = "Login" component = {LoginScreen} />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{title: 'Welcome'}}
        />
        <Stack.Screen name = "Profile" component = {ProfileScreen} />
        <Stack.Screen name = "Chats" component = {ChatsScreen} />
        <Stack.Screen name = "Settings" component = {SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
  
}
