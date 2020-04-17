//The bar at the bottom with a textbox and a send button.
import React, {Component} from "react";
import {Text, TextInput, TouchableHighlight, View} from "react-native";
import {chatInputStyles} from "./styles/ChatInputStyles";

export class InputBar extends Component {

    render() {
        return (
            <View style={chatInputStyles.inputBar}>
                <TextInput style={chatInputStyles.textBox}
                           multiline={true}
                           defaultHeight={30}
                           onChangeText={(text) => this.props.onChangeText(text)}
                           onContentSizeChange={this.props.onSizeChange}
                           value={this.props.text}/>
                <TouchableHighlight
                    style={chatInputStyles.sendButton}
                    onPress={() => this.props.onSendPressed()}>
                    <Text style={{color: 'white'}}>
                        Send
                    </Text>
                </TouchableHighlight>
            </View>
        );
    }
}