//The bar at the bottom with a textbox and a send button.
import React, {Component} from "react";
import {Text, TextInput, TouchableHighlight, View} from "react-native";
import {chatInputStyles} from "./styles/ChatInputStyles";
import ImagePickerView from "./ImagePickerView";
import {Icon} from "react-native-elements";

export class InputBar extends Component {

    render() {
        return (
            <View style={chatInputStyles.inputBar}>
                <TextInput style={chatInputStyles.textBox}
                           multiline={true}
                           onChangeText={(text) => this.props.onChangeText(text)}
                           onContentSizeChange={this.props.onSizeChange}
                           value={this.props.text}/>
                    <ImagePickerView/>
                <Icon
                    reverse
                    name='send'
                    type='feather'
                    size={20}
                    color={'#517fa4'}
                    onPress={this.props.onSendPressed}
                    underlayColor={'#233346'}
                />
            </View>
        );
    }
}