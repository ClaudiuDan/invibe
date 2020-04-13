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
import Axios from "axios";

//used to make random-sized messages
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const URL = 'wss://https://invibes.herokuapp.com/chat/';
const AUTH =  'authorization: ' + Axios.defaults.headers.common.Authorization;

// The actual chat view itself- a ScrollView of BubbleMessages, with an InputBar at the bottom, which moves with the keyboard
export default class ChatView extends Component {

    constructor(props) {
        super(props);
        const dummyText = 'Departure so attention pronounce satisfied daughters am. But shy tedious pressed studied opinion entered windows off. ' +
            'Advantage dependent suspicion convinced provision him yet. Timed balls match at by rooms we. Fat not boy neat left had with past here call.' +
            ' Court nay merit few nor party learn. Why our year her eyes know even how. Mr immediate remaining conveying allowance do or. ';

        //create a set number of texts with random lengths. Also randomly put them on the right (user) or left (other person).
        const numberOfMessages = 20;

        const messages = [];

        for (let i = 0; i < numberOfMessages; i++) {
            const messageLength = getRandomInt(10, 120);

            const direction = getRandomInt(1, 2) === 1 ? 'right' : 'left';

            const message = dummyText.substring(0, messageLength);

            messages.push({
                direction: direction,
                text: message
            })
        }

        this.state = {
            messages: messages,
            inputBarText: '',
            ws: new WebSocket(URL, {
                headers: {
                    authorization:  Axios.defaults.headers.common.Authorization,
                }
            }),
        }
    }

    static navigationOptions = {
        title: 'Chat',
    };

    //When the keyboard appears, this gets the ScrollView to move the end back "up" so the last message is visible with the keyboard up
    //Without this, whatever message is the keyboard's height from the bottom will look like the last message.
    keyboardDidShow(e) {
        this.scrollView.scrollToEnd();
    }

    //When the keyboard dissapears, this gets the ScrollView to move the last message back down.
    keyboardDidHide(e) {
        this.scrollView.scrollToEnd();
    }

    //scroll to bottom when first showing the view
    componentDidMount() {

        this.state.ws.onopen = () => {
            // on connecting, do nothing but log it to the console
            console.log('connected')
        };

        this.state.ws.onmessage = evt => {
            // on receiving a message, add it to the list of messages
            const message = JSON.parse(evt.data);
            console.log("Received message" + message);
            // this.addMessage(message)
        };

        this.state.ws.onclose = () => {
            console.log('disconnected');
            // automatically try to reconnect on connection loss
            this.setState({
                ws: new WebSocket(URL, AUTH),
            })
        };

        setTimeout(function () {
            this.scrollView.scrollToEnd();
        }.bind(this))
    }

    //this is a bit sloppy: this is to make sure it scrolls to the bottom when a message is added, but
    //the component could update for other reasons, for which we wouldn't want it to scroll to the bottom.
    componentDidUpdate() {
        setTimeout(function () {
            this.scrollView.scrollToEnd();
        }.bind(this))
    }

    _sendMessage() {
        const message = this.state.inputBarText;
        this.state.messages.push({direction: "right", text: message});
        this.state.ws.send(JSON.stringify({text: message, receiver: this.props.userId}));

        this.setState({
            messages: message,
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
                <MessageBubble key={index} direction={message.direction} text={message.text}/>
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
        var leftSpacer = this.props.direction === 'left' ? null : <View style={{width: 70}}/>;
        var rightSpacer = this.props.direction === 'left' ? <View style={{width: 70}}/> : null;

        var bubbleStyles = this.props.direction === 'left' ? [styles.messageBubble, styles.messageBubbleLeft] : [styles.messageBubble, styles.messageBubbleRight];

        var bubbleTextStyle = this.props.direction === 'left' ? styles.messageBubbleTextLeft : styles.messageBubbleTextRight;

        return (
            <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
                {leftSpacer}
                <View style={bubbleStyles}>
                    <Text style={bubbleTextStyle}>
                        {this.props.text}
                    </Text>
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

//TODO: separate these out. This is what happens when you're in a hurry!
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