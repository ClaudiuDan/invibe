//TODO: this is a copy of the ImageCameraOrGalleryPicker from the chat directory: refactor class so that we use only one class

import React, {Component} from 'react';
import {Icon} from 'react-native-elements'
import * as ImagePicker from 'expo-image-picker';
import {connectActionSheet} from '@expo/react-native-action-sheet'
import {chatColour, chatSelectedColour} from "../chat/styles/ChatsScreenStyles";

class ImageCameraOrGalleryPicker extends Component {

    constructor(props) {
        super(props);
    }

    getExtensionFromFileName = (fileName) => fileName.split('.').pop();

    launchCamera = async () => {
        ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            quality: 0.5,
            base64: true,

        }).then(result => {
            if (!result.cancelled) {
                this.props.onPress(`data:image/${this.getExtensionFromFileName(result.uri)};base64,${result.base64}`);
            }
        }).catch(err => console.log("Launch camera error in ImagePickerForProfile.", err));
    };

    launchGallery = async () => {
        ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            quality: 0.5,
            base64: true,
            allowsMultipleSelection: true,

        }).then(result => {
            if (!result.cancelled) {
                this.props.onPress(`data:image/${this.getExtensionFromFileName(result.uri)};base64,${result.base64}`);
            }
        }).catch(err => console.log("Launch gallery error in ImagePickerForProfile.", err))
    };

    openActionSheetImagePicker = () => {
        const options = ['Camera', 'Gallery'];
        const cancelButtonIndex = 2;

        this.props.showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex
            },
            buttonIndex => {
                if (buttonIndex === 0) {
                    this.launchCamera();
                } else if (buttonIndex === 1) {
                    this.launchGallery();
                }
            },
        );
    };


    render() {
        return (
            <Icon
                reverse
                name='camerao'
                type='antdesign'
                size={20}
                color={chatSelectedColour}
                onPress={this.openActionSheetImagePicker}
            />
        )
    }
}

export default connectActionSheet(ImageCameraOrGalleryPicker);