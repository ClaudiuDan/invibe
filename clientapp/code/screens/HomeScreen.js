import React, {Component} from 'react';
import {Button, View} from "react-native";
import {connect} from "react-redux";
import {retrieveChatsList} from "../redux/actions/ChatAction";
import {openWebSocket} from "../redux/actions/CommunicationAction";

import {getProfile} from "../redux/actions/ProfileAction";

class HomeScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            webSocket: null,
        }
    }

    componentDidMount() {
        this.props.retrieveChatsList();
        this.props.openWebSocket();
        this.props.getProfile(this.props.userId, false);
    }

    render() {
        return (
            <View>
                <Button
                    title="Profile"
                    onPress={() => this.props.navigation.navigate('Profile',  {userId: this.props.userId, editable: true})}
                />
                <Button
                    title="Chats"
                    onPress={() => this.props.navigation.navigate('Chats')}
                />
                <Button
                    title="Discover"
                    onPress={() => this.props.navigation.navigate('Discover')}
                />
                <Button
                    title="Settings"
                    onPress={() => this.props.navigation.navigate('Settings')}
                />
            </View>
        );
    }
}

const mapStateToProps = state => ({
    webSocket: state.chat.webSocket,
    userId: state.auth.userId,
});

export default connect(mapStateToProps, {openWebSocket, retrieveChatsList, getProfile})(HomeScreen);