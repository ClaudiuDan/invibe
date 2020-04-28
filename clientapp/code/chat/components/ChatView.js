import React, {Component} from 'react';
import {ActivityIndicator, Dimensions, Keyboard, ScrollView, Text, View,} from 'react-native';
import {connect} from "react-redux";
import {addMessage, retrieveChat, setChatInfoLoadingStatus} from "../../redux/actions/ChatAction";
import {chatInputStyles} from "../styles/ChatInputStyles";
import {InputBar} from "./ChatInputBar";
import TextChatMessage from "../classes/messagesTypes/TextChatMessage";
import {daysBetween} from "../../Utils/Utils";
import {chatSelectedColour} from "../styles/ChatsScreenStyles";
import {stylesUtils} from "../../Utils/StylesUtils";
import {ChatInfoStatus} from "../classes/ChatInfo";

class ChatView extends Component {

    constructor(props) {
        super(props);

        const toLoad = !this.props.chatsList.chatsInfo[this.props.receiverId].messages.length;

        this.state = {
            chatInfo: this.props.chatsList.chatsInfo[this.props.receiverId],
            inputBarText: '',
            bottomReached: true,
            loading: toLoad
        };

        if (toLoad) {
            this.props.setChatInfoLoadingStatus(this.props.receiverId, ChatInfoStatus.UNLOADED);
        }
    }

    componentDidMount() {
        Keyboard.addListener('keyboardDidShow', this.scrollToEndTimeout);

        setTimeout(() => {
            if (this.getChatInfoStatus() === ChatInfoStatus.UNLOADED) {
                this.setState({loading: true});
                this.props.retrieveChat(this.state.chatInfo);
            }
        });

        this.scrollToEndTimeout();
    }

    static getDerivedStateFromProps(nextProps) {
        return {
            chatsList: nextProps.chatsList,
            isChatInfoLoading: nextProps.isChatInfoLoading,
        }
    }

    componentWillUnmount() {
        Keyboard.removeListener("keyboardDidShow", this.scrollToEndTimeout);
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

        if (this.getChatInfoStatus() === ChatInfoStatus.LOADED && this.state.loading) {
            this.setState({loading: false});
        }

        if (this.props.chatsList.chatsInfo[this.props.receiverId] !== this.state.chatInfo) {
            this.setState({
                chatInfo: this.props.chatsList.chatsInfo[this.props.receiverId],
            });

            if (this.state.bottomReached) {
                this.scrollToEndTimeout(20);
            }

            setTimeout(this.checkForMessageReads)
        }
    }

    checkForMessageReads = () => {
        let createdDateTime = null;
        this.props.chatsList.chatsInfo[this.props.receiverId].messages.forEach(msg => {
            if (msg.direction === "left" && !msg.seen) {
                createdDateTime = msg.createdTimestamp;
            }
        });
        if (createdDateTime && this.props.ws.readyState === WebSocket.OPEN) {
            this.props.ws.send(JSON.stringify({
                type: "messages_read",
                sender: this.props.receiverId,
                created_timestamp: createdDateTime
            }))
        }
    };

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

    getChatDateComponent = (text, index) => {
        return (
            <Text style={{fontStyle: "italic", color: "#5b5b5b", textAlign: "center", paddingTop: 7, paddingBottom: 7}}
                  key={index}>
                {"- " + text + " -"}
            </Text>);
    };

    getChatInfoStatus = () => this.props.receiverId in this.props.isChatInfoLoading ?
        this.props.isChatInfoLoading[this.props.receiverId] : ChatInfoStatus.UNLOADED;

    scrollToEndTimeout = (delay = 0, animated = true) => {
        setTimeout(() => {
            if (this && this.scrollView) {
                this.scrollView.scrollToEnd({animated: animated});
            }
        }, delay);
    };

    render() {
        const messages = this.state.chatInfo.messages;
        let scrollViewContent = [this.getChatDateComponent("Start the conversation with an Invibe challenge", 0)];

        if (messages.length > 0) {
            let currDateTime = messages[0].datetime;
            let index = 0;

            scrollViewContent = messages.reduce((contentSoFar, msg) => {
                if (daysBetween(msg.datetime, currDateTime) >= 1) {
                    currDateTime = msg.datetime;
                    index++;
                    contentSoFar.push(this.getChatDateComponent(currDateTime.toDateString(), index));
                }
                index++;
                contentSoFar.push(msg.getComponentToRender(index));
                return contentSoFar;
            }, [this.getChatDateComponent(currDateTime.toDateString(), index)]);
        }

        return (
            <View style={chatInputStyles.outer}>
                {this.state.loading ? (
                    <View style={stylesUtils.loading}>
                        <ActivityIndicator style={{paddingTop: 20}} size="large" color={chatSelectedColour}/>
                    </View>
                ) : (
                    <>
                        <ScrollView
                            ref={(ref) => {
                                this.scrollView = ref
                            }}
                            onScroll={this.checkIfBottomReached}
                            style={chatInputStyles.messages}>
                            {scrollViewContent}
                        </ScrollView>
                        < InputBar onSendPressed={this.sendMessage}
                                   onSizeChange={() => this.scrollToEndTimeout(0, false)}
                                   onChangeText={this._onChangeInputBarText}
                                   createTextMessage={this.createTextMessage}
                                   receiverId={this.props.receiverId}
                                   text={this.state.inputBarText}/>
                    </>
                )}
            </View>
        );
    }
}


const mapStateToProps = state => ({
    chatsList: state.chat.chatsList,
    ws: state.chat.webSocket,
    isChatInfoLoading: state.chat.isChatInfoLoading,
    userId: state.auth.userId,
});


export default connect(mapStateToProps, {addMessage, retrieveChat, setChatInfoLoadingStatus})(ChatView);

