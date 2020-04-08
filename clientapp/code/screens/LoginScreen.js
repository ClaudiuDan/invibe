import * as React from 'react';
import { Button } from "react-native";

export function LoginScreen({navigation}) {
    return (
        <Button
        title="Login"
        onPress={() => facebookLogin(navigation)}
        />
    );
}

const LOGIN_REQ_LINK = "https://google.com";
const OK_STATUS = 200
async function facebookLogin(navigation) {
    try {
        const response = await fetch(LOGIN_REQ_LINK);
        if (response.status == OK_STATUS) {
            navigation.navigate('Home');
        }
        console.log(response.status);
        // navigation.navigate('Home');
    }
    catch (error) {
        console.error(error);
    }
}