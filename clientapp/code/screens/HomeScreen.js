import React, {Component} from 'react';
import {Button, View} from "react-native";
import {connect} from "react-redux";
import {openWebSocketForChat, retrieveChatsList} from "../redux/actions/ChatAction";

class HomeScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            webSocket: null,
            chatsList: [],
        }
    }

    componentDidMount() {
        this.props.retrieveChatsList();
        this.props.openWebSocketForChat();
    }

    render() {
        return (
            <View>
                <Button
                    title="Go to Profile"
                    onPress={() => this.props.navigation.navigate('Profile')}
                />
                <Button
                    title="Go to Settings"
                    onPress={() => this.props.navigation.navigate('Settings')}
                />
                <Button
                    title="Go to Chats"
                    onPress={() => this.props.navigation.navigate('Chats')}
                />
            </View>
        );
    }
}

const mapStateToProps = state => ({
    webSocket: state.chat.webSocket,
    chatsList: state.chat.chatsList,
});

export default connect(mapStateToProps, {openWebSocketForChat, retrieveChatsList})(HomeScreen);