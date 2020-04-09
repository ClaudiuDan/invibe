import React, { Component } from 'react';
import { Button, View } from "react-native";
import {connect} from "react-redux";
import {signOut} from "../redux/actions/AuthAction";

class SettingsScreen extends Component {
    render() {
        return (
            <View>
                <Button
                    title="Go back"
                    onPress={() => this.props.navigation.navigate('Home')}
                />
                <Button
                    title="Sign Out"
                    onPress={() => this.props.signOut()}
                />
            </View>
        );
    }
}

export default connect(null, {signOut})(SettingsScreen);