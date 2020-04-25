import React, {Component} from 'react';
import {Keyboard, ScrollView, View,} from 'react-native';
import {connect} from "react-redux";
import {addMessage, getChat, retrieveChat} from "../../redux/actions/ChatAction";
import {chatInputStyles} from "../styles/ChatInputStyles";
import {InputBar} from "./ChatInputBar";
import TextChatMessage from "../classes/messagesTypes/TextChatMessage";

class ChatView extends Component {

    constructor(props) {
        super(props);

        this.state = {
            chatInfo: this.props.chatsList.chatsInfo[this.props.receiverId],
            inputBarText: '',
        };
    }

    _keyboardDidShow = () => {
        setTimeout(() => {
            if (this && this.scrollView) {
                this.scrollView.scrollToEnd();
            }
        });
    };

    componentDidMount() {
        Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);

        setTimeout(() => this.props.retrieveChat(this.state.chatInfo));

        setTimeout(() => {
            console.log("chat length")
            console.log(this.state.chatInfo.messages.length);
            if (!this.state.chatInfo.messages.length) {
                this.props.getChat(this.props.receiverId);
            }
        }, 700);

        setTimeout(() => this.scrollView.scrollToEnd());
    }

    static getDerivedStateFromProps(nextProps) {
        return {
            chatsList: nextProps.chatsList,
        }
    }

    componentWillUnmount() {
        Keyboard.removeListener("keyboardDidShow", this._keyboardDidShow);
    }

    componentDidUpdate(_prevProps, _prevState, _snapshot) {
        if (this.props.chatsList.chatsInfo[this.props.receiverId] !== this.state.chatInfo) {
            this.setState({
                chatInfo: this.props.chatsList.chatsInfo[this.props.receiverId],
            });
            setTimeout(() => this.scrollView.scrollToEnd(), 20);
        }
    }

    createTextMessage = () => this.state.inputBarText ?
        new TextChatMessage(
            this.state.inputBarText,
            "right",
            this.props.receiverId) : null;

    sendMessage = (msg) => {

        if (msg) {
            this.props.addMessage(msg);

            this.setState({
                inputBarText: ''
            });

            Keyboard.dismiss()
        }
    };

    _onChangeInputBarText = (text) => {
        this.setState({
            inputBarText: text
        });
    };

    _onInputSizeChange = () => {
        setTimeout(() => this.scrollView.scrollToEnd({animated: false}));
    };

    render() {

        const messages = this.state.chatInfo.messages.map((message, index) => message.getComponentToRender(index));

        return (
            <View style={chatInputStyles.outer}>
                <ScrollView
                    ref={(ref) => {
                        this.scrollView = ref
                    }}
                    style={chatInputStyles.messages}>
                    {messages}
                </ScrollView>
                <InputBar onSendPressed={this.sendMessage}
                          onSizeChange={this._onInputSizeChange}
                          onChangeText={this._onChangeInputBarText}
                          createTextMessage={this.createTextMessage}
                          receiverId={this.props.receiverId}
                          text={this.state.inputBarText}/>
            </View>
        );
    }
}


const mapStateToProps = state => ({
    chatsList: state.chat.chatsList,
    ws: state.chat.webSocket,
    userId: state.auth.userId,
});


export default connect(mapStateToProps, {getChat, addMessage, retrieveChat})(ChatView);

