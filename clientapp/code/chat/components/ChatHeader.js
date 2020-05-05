import React, {Component} from 'react';
import {Dimensions, Image, Text, TouchableOpacity, View} from "react-native";
import PROFILE_IMAGE_PLACEHOLDER from "../../../assets/profile-image-placeholder.png"
import {chatSelectedColour} from "../styles/ChatsScreenStyles";
import Axios from "axios";

class ChatHeader extends Component {

    constructor(props) {
        super(props);

        this.state = {
            receiverName: "User " + this.props.receiverId,
            receiverProfileImage: PROFILE_IMAGE_PLACEHOLDER,
        }
    }

    componentDidMount() {
        Axios
            .get(`/profile/`, {params: {user_id: this.props.receiverId, with_album_images: false}})
            .then(response => {
                const parsedData = JSON.parse(response.data);

                const receiverProfileImage = "profile_image" in parsedData ?
                    {uri: `data:image/${parsedData.profile_image_extension};base64,${parsedData.profile_image}`} :
                    PROFILE_IMAGE_PLACEHOLDER;

                const receiverName = parsedData.name !== "" ? parsedData.name : this.state.receiverName;

                this.setState({
                    receiverName: receiverName,
                    receiverProfileImage: receiverProfileImage,
                });
            })
            .catch(error => {
                console.log("Could not get user profile from server", this.props.receiverId, error);
            });
    }

    goToProfile = () => {
        this.props.navigation.push("Profile", {userId: this.props.receiverId});
    }

    render() {
        const receiverProfileImageDimension = Dimensions.get('window').width / 7.5;
        const spaceBetween = Dimensions.get('window').width / 50;
        return (
            <View style={{
                flexDirection: "row",
                alignItems: 'center',
                justifyContent: "flex-end",
                // borderColor:'red', borderWidth:1,
                width: Dimensions.get('window').width / 1.4,
            }}>
                <TouchableOpacity onPress={this.goToProfile}>
                    <Text style={{
                        fontSize: 23,
                        marginRight: spaceBetween,
                        textAlignVertical: "center",
                        color: chatSelectedColour,
                        fontWeight: 'bold',
                    }}>{this.state.receiverName} </Text>
                </TouchableOpacity>
                <TouchableOpacity style={{
                    borderRadius: receiverProfileImageDimension,
                    backgroundColor: "black",
                    width: receiverProfileImageDimension,
                    height: receiverProfileImageDimension,
                }} onPress={this.goToProfile}>
                    <Image source={this.state.receiverProfileImage}
                           style={{
                               width: receiverProfileImageDimension,
                               height: receiverProfileImageDimension,
                               borderRadius: receiverProfileImageDimension
                           }}
                           resizeMode={"cover"}/>
                </TouchableOpacity>
            </View>
        );
    }
}

export default ChatHeader;