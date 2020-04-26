import React, {Component} from 'react';
import {Dimensions, Keyboard, ScrollView, Text, View,} from 'react-native';
import {connect} from "react-redux";
import {addMessage, getChat, retrieveChat} from "../../redux/actions/ChatAction";
import {chatInputStyles} from "../styles/ChatInputStyles";
import {InputBar} from "./ChatInputBar";
import TextChatMessage from "../classes/messagesTypes/TextChatMessage";
import {daysBetween} from "../../Utils/Utils";

class ChatView extends Component {

    constructor(props) {
        super(props);

        this.state = {
            chatInfo: this.props.chatsList.chatsInfo[this.props.receiverId],
            inputBarText: '',
            bottomReached: true,
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

        setTimeout(() => {
            if (!this.state.chatInfo.messages.length) {
                this.props.retrieveChat(this.state.chatInfo)
            }
        });

        setTimeout(() => {
            this.props.getChat(this.props.receiverId);
        }, 200);

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

    checkIfBottomReached = (e) => {
        const windowHeight = Dimensions.get('window').height,
            height = e.nativeEvent.contentSize.height,
            offset = e.nativeEvent.contentOffset.y;
        if (windowHeight + offset >= height && !this.state.bottomReached) {
            this.setState({
                bottomReached: true,
            });
        }
        if (this.state.bottomReached) {
            this.setState({
                bottomReached: false,
            });
        }
    };

    componentDidUpdate(_prevProps, _prevState, _snapshot) {
        if (this.props.chatsList.chatsInfo[this.props.receiverId] !== this.state.chatInfo) {
            this.setState({
                chatInfo: this.props.chatsList.chatsInfo[this.props.receiverId],
            });
            setTimeout(() => {
                if (this.state.bottomReached) {
                    this.scrollView.scrollToEnd()
                }
            }, 20);
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

    getChatDateComponent = (date, index) => {
        return (
            <Text style={{fontStyle: "italic", color: "#5b5b5b", textAlign: "center", paddingTop: 7, paddingBottom: 7}}
                  key={index}>
                {"- " + date.toDateString() + " -"}
            </Text>);
    };

    render() {
        const messages = this.state.chatInfo.messages;
        let currDateTime = messages.length > 0 ? messages[0].datetime : new Date();
        let index = 0;

        const scrollViewContent = messages.reduce((contentSoFar, msg) => {
            if (daysBetween(msg.datetime, currDateTime) >= 1) {
                currDateTime = msg.datetime;
                index++;
                contentSoFar.push(this.getChatDateComponent(currDateTime, index));
            }
            index++;
            contentSoFar.push(msg.getComponentToRender(index));
            return contentSoFar;
        }, [this.getChatDateComponent(currDateTime, index)]);

        return (
            <View style={chatInputStyles.outer}>
                <ScrollView
                    ref={(ref) => {
                        this.scrollView = ref
                    }}
                    onScroll={this.checkIfBottomReached}
                    style={chatInputStyles.messages}>
                    {scrollViewContent}
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

