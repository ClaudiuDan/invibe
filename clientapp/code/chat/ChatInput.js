import React, {Component} from 'react';
import {
    Text,
    View,
    StyleSheet,
    ScrollView,
    Keyboard,
    TextInput,
    TouchableHighlight,
} from 'react-native';
import Axios from 'axios';
import update from 'immutability-helper';

const URL = 'wss://invibes.herokuapp.com/chat/';
const AUTH = 'authorization: ' + Axios.defaults.headers.common.Authorization;

// The actual chat view itself- a ScrollView of BubbleMessages, with an InputBar at the bottom, which moves with the keyboard
export default class ChatView extends Component {

    constructor(props) {
        super(props);

        this.state = {
            messages: [],
            inputBarText: '',
            ws: this.createWebSocket(),
        }
    }

    parseISOString = (s) => {
        const b = s.split(/\D+/);
        return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
    };

    createWebSocket = () => {
        const ws = new WebSocket(URL);

        ws.onopen = () => {
            const handshake = {
                type: 'handshake',
                receiver: this.props.userId,
                token: Axios.defaults.headers.common.Authorization.split(' ')[1],
            };

            ws.send(JSON.stringify(handshake));
        };

        ws.onmessage = (message) => {
            const messageData = JSON.parse(message.data);
            if (messageData.type === 'message_echo') {
                let i = this.state.messages.length - 1;
                while (i >= 0 && this.state.messages[i].frontend_id !== messageData.frontend_id) {
                    i--;
                }
                if (i >= 0) {
                    this.setState({
                        messages: update(this.state.messages, {
                            [i]: {
                                datetime: {$set: this.parseISOString(messageData.datetime)},
                                sent: {$set: true},
                                id: {$set: messageData.id}
                            }
                        })
                    });
                }
            } else if (messageData.type === 'new_message') {
                console.log("new_mess");
                this.setState(prevState => ({
                    messages: [...prevState.messages,
                        {
                            direction: "left",
                            text: messageData.text,
                            datetime: this.parseISOString(messageData.datetime),
                            sent: false,
                            frontend_id: messageData.frontend_id,
                            id: messageData.id
                        }]
                }));
            }
        };

        ws.onclose = (reason) => {
            console.log(reason);

            setTimeout(() => this.setState({
                ws: this.createWebSocket(),
            }), 3000);
        };

        return ws;
    };


    // Scroll to bottom when first showing the view
    componentDidMount() {

        Axios
            .get(`/chat/get_chat/`, {params: {receiver: this.props.userId}})
            .then(response => {
                const messages = JSON.parse(response.data).messages;
                const new_messages = [];
                const userId = this.props.userId;
                messages
                    .forEach(message => {
                        if (message.sender == userId) {
                            console.log("here")
                            new_messages.push(
                                {
                                    direction: "left",
                                    text: message.text,
                                    datetime: this.parseISOString(message.datetime),
                                    sent: false,
                                    frontend_id: message.frontend_id,
                                    id: message.id
                                }
                            )
                        } else {
                            new_messages.push(
                                {
                                    direction: "right",
                                    text: message.text,
                                    datetime: this.parseISOString(message.datetime),
                                    sent: true,
                                    frontend_id: message.frontend_id,
                                    id: message.id
                                }
                            )
                        }
                    })
                this.setState({
                    messages: new_messages
                })
            })
            .catch(error => console.log(error));

        setTimeout(function () {
            this.scrollView.scrollToEnd();
        }.bind(this))
    }

    componentWillUnmount() {
        this.state.ws.close();
    }

    //this is a bit sloppy: this is to make sure it scrolls to the bottom when a message is added, but
    //the component could update for other reasons, for which we wouldn't want it to scroll to the bottom.
    componentDidUpdate() {
        setTimeout(function () {
            this.scrollView.scrollToEnd();
        }.bind(this))
    }

    genFrontendId = (length) => {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    };


    _sendMessage() {
        const message = this.state.inputBarText;
        const frontend_id = this.genFrontendId(64);

        this.setState(prevState => ({
            messages: [...prevState.messages,
                {
                    type: "message",
                    direction: "right",
                    text: message,
                    datetime: new Date(Date.now()),
                    sent: false,
                    frontend_id: frontend_id,
                    id: 0
                }]
        }));

        this.state.ws.send(JSON.stringify({
            type: 'message',
            text: message,
            receiver: this.props.userId,
            frontend_id: frontend_id
        }));

        this.setState({
            inputBarText: ''
        });

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
        setTimeout(function () {
            this.scrollView.scrollToEnd({animated: false});
        }.bind(this))
    }

    render() {

        const messages = [];

        this.state.messages.forEach(function (message, index) {
            messages.push(
                <MessageBubble key={index} direction={message.direction} text={message.text} datetime={message.datetime}
                               sent={message.sent}/>
            );
        });

        return (
            <View style={styles.outer}>
                <ScrollView ref={(ref) => {
                    this.scrollView = ref
                }} style={styles.messages}>
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

//The bubbles that appear on the left or the right for the messages.
class MessageBubble extends Component {
    render() {

        //These spacers make the message bubble stay to the left or the right, depending on who is speaking, even if the message is multiple lines.
        const leftSpacer = this.props.direction === 'left' ? null : <View style={{width: 70}}/>;
        const rightSpacer = this.props.direction === 'left' ? <View style={{width: 70}}/> : null;
        const sent = this.props.direction === 'left' ? '' : this.props.sent ? 'Sent' : 'Sending';

        const bubbleStyles = this.props.direction === 'left' ? [styles.messageBubble, styles.messageBubbleLeft] : [styles.messageBubble, styles.messageBubbleRight];

        const bubbleTextStyle = this.props.direction === 'left' ? styles.messageBubbleTextLeft : styles.messageBubbleTextRight;
        const bubbleTextDate = this.props.direction === 'left' ? {color: '#3a3a3a'} : {color: '#d8d6d3'};

        return (
            <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
                {leftSpacer}
                <View style={bubbleStyles}>
                    <View>
                        <Text style={bubbleTextStyle}>
                            {this.props.text}
                            {/*{this.props.datetime.getHours() + ':' + this.props.datetime.getMinutes()}*/}
                        </Text>
                        <Text style={{...bubbleTextDate, textAlign: 'left'}}>
                            {this.props.datetime.getHours() + ':' + this.props.datetime.getMinutes() + ' ' + sent}
                        </Text>
                    </View>
                </View>
                {rightSpacer}
            </View>
        );
    }
}

//The bar at the bottom with a textbox and a send button.
class InputBar extends Component {

    render() {
        return (
            <View style={styles.inputBar}>
                <TextInput style={styles.textBox}
                           multiline={true}
                           defaultHeight={30}
                           onChangeText={(text) => this.props.onChangeText(text)}
                           onContentSizeChange={this.props.onSizeChange}
                           value={this.props.text}/>
                <TouchableHighlight style={styles.sendButton} onPress={() => this.props.onSendPressed()}>
                    <Text style={{color: 'white'}}>Send</Text>
                </TouchableHighlight>
            </View>
        );
    }
}

//TODO: separate these out.
const styles = StyleSheet.create({

    //ChatView

    outer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: 'white'
    },

    messages: {
        flex: 1,
    },

    //InputBar

    inputBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 5,
        paddingVertical: 3,
    },

    textBox: {
        borderRadius: 20,
        borderWidth: 1,
        alignItems: "center",
        borderColor: 'gray',
        flex: 1,
        fontSize: 17,
        paddingHorizontal: 10
    },

    sendButton: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 15,
        marginLeft: 5,
        paddingRight: 15,
        borderRadius: 20,
        backgroundColor: '#2196F3'
    },

    //MessageBubble

    messageBubble: {
        borderRadius: 20,
        marginTop: 8,
        marginRight: 10,
        marginLeft: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
        flexDirection: 'row',
        flex: 1
    },

    messageBubbleLeft: {
        backgroundColor: '#d5d8d4',
    },

    messageBubbleTextLeft: {
        color: 'black'
    },

    messageBubbleRight: {
        backgroundColor: '#2196F3'
    },

    messageBubbleTextRight: {
        color: 'white'
    },
})