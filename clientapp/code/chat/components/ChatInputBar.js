//The bar at the bottom with a textbox and a send button.
import React, {Component} from "react";
import {TextInput, View} from "react-native";
import {chatInputStyles} from "../styles/ChatInputStyles";
import ImagePickerView from "./ImageCameraOrGalleryPicker";
import {Icon} from "react-native-elements";
import {chatColour, chatSelectedColour} from "../styles/ChatsScreenStyles";

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
                    color={chatColour}
                    onPress={this.props.onSendPressed}
                    underlayColor={chatSelectedColour}
                />
            </View>
        );
    }
}