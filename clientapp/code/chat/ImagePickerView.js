import React, {Component} from 'react';
import {Icon} from 'react-native-elements'
import * as ImagePicker from 'expo-image-picker';
import {connectActionSheet} from '@expo/react-native-action-sheet'

class ImagePickerView extends Component {

    constructor(props) {
        super(props);

        this.state = {
            image: null
        }
    }

    launchCamera = async () => {
        try {
            let result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                quality: 0.5,
                base64: true,

            });
            if (!result.cancelled) {
                this.setState({image: result.uri});
            }
        } catch (E) {
            console.log(E);
        }
    };

    launchGallery = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                quality: 0.5,
                base64: true,

            });
            if (!result.cancelled) {
                this.setState({image: result.uri});
            }
        } catch (E) {
            console.log(E);
        }
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
                color={'#517fa4'}
                onPress={this.openActionSheetImagePicker}
                underlayColor={'#233346'}

            />
        )
    }
}

export default connectActionSheet(ImagePickerView);