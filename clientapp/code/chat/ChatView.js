import React, {Component} from 'react';
import {Keyboard, ScrollView, View,} from 'react-native';
import {connect} from "react-redux";
import {addMessage, getChat} from "../redux/actions/ChatAction";
import {chatInputStyles} from "./styles/ChatInputStyles";
import {MessageBubble} from "./MessageBubble";
import {InputBar} from "./ChatInputBar";

class ChatView extends Component {

    constructor(props) {
        super(props);

        const userId = this.props.userId.toString();
        this.state = {
            messages: userId in this.props.all_ms ? this.props.all_ms[userId] : [],
            inputBarText: '',
        }
    }

    componentDidMount() {
        if (!(this.props.userId.toString() in this.props.all_ms)) {
            this.props.getChat(this.props.userId.toString());
        }
        setTimeout(() => this.scrollView.scrollToEnd());
    }

    static getDerivedStateFromProps(nextProps) {
        return {
            all_ms: nextProps.all_ms,
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const userId = this.props.userId.toString();
        if (userId in this.props.all_ms && this.props.all_ms[userId] !== this.state.messages) {
            this.setState({
                messages: this.props.all_ms[userId],
            });
            setTimeout(() => this.scrollView.scrollToEnd(), 20);
        }
    }

    _sendMessage() {
        const message = this.state.inputBarText;

        if (message) {
            this.props.addMessage(
                {
                    direction: "right",
                    text: message,
                    datetime: new Date(),
                    created_timestamp: Math.floor(Date.now() / 1000),
                    sent: false,
                    id: 0,
                }, this.props.userId
            );

            this.setState({
                inputBarText: ''
            });
        }

        Keyboard.dismiss()
    }

    _onChangeInputBarText(text) {
        this.setState({
            inputBarText: text
        });
    }

    //This event fires way too often.
    //We need to move the last message up if the input bar expands due to the user's new message exceeding the height of the box.
    //We really only need to do anything when the height of the InputBar changes, but AutogrowInput can't tell us that.
    //The real solution here is probably a fork of AutogrowInput that can provide this information.
    _onInputSizeChange() {
        setTimeout(() => this.scrollView.scrollToEnd({animated: false}));
    }

    render() {

        const messages = [];

        this.state.messages.forEach((message, index) => {
            messages.push(
                <MessageBubble key={index}
                               direction={message.direction}
                               text={message.text}
                               datetime={message.datetime}
                               sent={message.sent}/>
            );
        });

        return (
            <View style={chatInputStyles.outer}>
                <ScrollView
                    ref={(ref) => {
                        this.scrollView = ref
                    }}
                    style={chatInputStyles.messages}>
                    {messages}
                </ScrollView>
                <InputBar onSendPressed={() => this._sendMessage()}
                          onSizeChange={() => this._onInputSizeChange()}
                          onChangeText={(text) => this._onChangeInputBarText(text)}
                          text={this.state.inputBarText}/>
            </View>
        );
    }
}


const mapStateToProps = state => ({
    all_ms: state.chat.messages,
    ws: state.chat.webSocket,
});


export default connect(mapStateToProps, {getChat, addMessage})(ChatView);

