import React, {Component} from 'react';
import {Keyboard, ScrollView, View,} from 'react-native';
import {connect} from "react-redux";
import {addMessage, getChat, retrieveChat} from "../../redux/actions/ChatAction";
import {chatInputStyles} from "../styles/ChatInputStyles";
import {InputBar} from "./ChatInputBar";
import TextChatMessage from "../classes/TextChatMessage";

class ChatView extends Component {

    constructor(props) {
        super(props);

        this.state = {
            chatInfo: this.props.chatsList.chatsInfo[this.props.receiverId],
            inputBarText: '',
        };
        console.log(this.state.chatInfo);
        this.props.retrieveChat(this.state.chatInfo);
    }

    componentDidMount() {
        if (!this.state.chatInfo.messages.length) {
            this.props.getChat(this.props.receiverId);
        }
        setTimeout(() => this.scrollView.scrollToEnd());
    }

    static getDerivedStateFromProps(nextProps) {
        return {
            chatsList: nextProps.chatsList,
        }
    }

    componentDidUpdate() {
        if (this.props.chatsList.chatsInfo[this.props.receiverId] !== this.state.chatInfo) {
            this.setState({
                chatInfo: this.props.chatsList.chatsInfo[this.props.receiverId],
            });
            setTimeout(() => this.scrollView.scrollToEnd(), 20);
        }
    }

    _sendMessage() {
        const message = this.state.inputBarText;

        if (message) {
            this.props.addMessage(
                new TextChatMessage(
                    message,
                    "right",
                    this.props.receiverId)
            );

            this.setState({
                inputBarText: ''
            });

            Keyboard.dismiss()
        }
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

        const messages = this.state.chatInfo.messages.map((message, index) => message.getComponentToRender(index));
        // messages.push(<MessageBox key={100}
        //                           direction={"right"}
        //                           text={""}
        //                           datetime={new Date()}
        //                           sent={true}
        //                           content={<ImageContent key={1000}/>}
        // />);

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
    chatsList: state.chat.chatsList,
    ws: state.chat.webSocket,
    userId: state.auth.userId,
});


export default connect(mapStateToProps, {getChat, addMessage, retrieveChat})(ChatView);

