import React, {Component} from 'react';
import {Button, View} from "react-native";
import {connect} from "react-redux";
import {openWebSocketForChat, restoreChatsList} from "../redux/actions/ChatAction";

class HomeScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            webSockets: {},
            chatsList: [],
        }
    }

    componentDidMount() {
        this.props.restoreChatsList();

        setTimeout(() => this.state.chatsList.forEach(chat => {
            if (!([chat.receiver.toString()] in this.state.webSockets)) {
                this.props.openWebSocketForChat(chat.receiver.toString());
            }
        }), 500);
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
    webSockets: state.chat.webSockets,
    chatsList: state.chat.chatsList,
});

export default connect(mapStateToProps, {restoreChatsList, openWebSocketForChat})(HomeScreen);