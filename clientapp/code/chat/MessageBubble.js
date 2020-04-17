//The bubbles that appear on the left or the right for the messages.
import React, {Component} from "react";
import {Text, View} from "react-native";
import {chatInputStyles} from "./styles/ChatInputStyles";

export class MessageBubble extends Component {
    render() {

        //These spacers make the message bubble stay to the left or the right, depending on who is speaking, even if the message is multiple lines.
        const leftSpacer = this.props.direction === 'left' ? null : <View style={{width: 70}}/>;
        const rightSpacer = this.props.direction === 'left' ? <View style={{width: 70}}/> : null;
        const sent = this.props.direction === 'left' ? '' : this.props.sent ? 'Sent' : 'Sending';

        const bubbleStyles = this.props.direction === 'left' ? [chatInputStyles.messageBubble, chatInputStyles.messageBubbleLeft] : [chatInputStyles.messageBubble, chatInputStyles.messageBubbleRight];

        const bubbleTextStyle = this.props.direction === 'left' ? chatInputStyles.messageBubbleTextLeft : chatInputStyles.messageBubbleTextRight;
        const bubbleTextDate = this.props.direction === 'left' ? {color: '#3a3a3a'} : {color: '#d8d6d3'};

        return (
            <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
                {leftSpacer}
                <View style={bubbleStyles}>
                    <View>
                        <Text style={bubbleTextStyle}>
                            {this.props.text}
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