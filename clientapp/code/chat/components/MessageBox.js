//The bubbles that appear on the left or the right for the messages.
import React, {Component} from "react";
import {Image, Text, TouchableOpacity, View} from "react-native";
import {chatInputStyles} from "../styles/ChatInputStyles";
import {formatAMPM} from "../../Utils/Utils";
import Lightbox from "react-native-lightbox";

export class MessageBox extends Component {
    render() {

        const leftSpacer = this.props.direction === "left" ? null : <View style={{width: 70}}/>;
        const rightSpacer = this.props.direction === "left" ? <View style={{width: 70}}/> : null;
        const bubbleStyles = this.props.direction === "left" ?
            [chatInputStyles.messageBubble, chatInputStyles.messageBubbleLeft] :
            [chatInputStyles.messageBubble, chatInputStyles.messageBubbleRight];


        return (
            <View style={{justifyContent: "space-between", flexDirection: "row"}}>
                {leftSpacer}
                <View style={bubbleStyles}>
                    <View>
                        {this.props.content}
                        {this.getDateText()}
                    </View>
                </View>
                {rightSpacer}
            </View>
        );
    }

    getDateText() {
        const status = this.props.direction === "left" ? "" : this.props.sent ? "Sent" : "Sending";
        const bubbleTextDate = this.props.direction === "left" ? {color: "#3a3a3a"} : {color: "#d8d6d3"};

        return <Text style={{...bubbleTextDate, textAlign: "left"}}>
            {status + " " + formatAMPM(this.props.datetime)}
        </Text>;
    }
}

export class TextContent extends Component {
    render() {
        const bubbleTextStyle = this.props.direction === "left" ?
            chatInputStyles.messageBubbleTextLeft :
            chatInputStyles.messageBubbleTextRight;

        return <Text style={bubbleTextStyle}> {this.props.text} </Text>;
    }
}

export class ImageContent extends Component {

    render() {
        return (
            <TouchableOpacity
                key={this.props.key}
                style={{borderRadius: 15, marginTop: 4, marginBottom: 5, width: 250, height: 120}}
            >
                <Lightbox navigator={this.props.navigation}
                >
                    <Image
                        style={{
                            width: "100%",
                            height: "100%",
                        }}
                        resizeMode={"cover"}
                        source={{uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80"}}
                    />
                </Lightbox>
            </TouchableOpacity>
        )
    }
}