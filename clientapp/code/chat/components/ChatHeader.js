import React, {Component} from 'react';
import {Dimensions, Image, Text, TouchableWithoutFeedback, View} from "react-native";
import {chatSelectedColour} from "../styles/ChatsScreenStyles";
import {connect} from "react-redux";
import {getProfile} from "../../redux/actions/ProfileAction";
import UserProfile from "../../profile/UserProfile";
import {profileStatus} from "../../profile/ProfileStatus";

class ChatHeader extends Component {

    constructor(props) {
        super(props);

        this.state = {
            userProfile:  this.props.receiverId in this.props.profiles ? this.props.profiles[this.props.receiverId] : new UserProfile(this.props.receiverId)
        }
    }

    componentDidMount() {
        if ([profileStatus.UNLOADED, profileStatus.ERROR].includes(this.state.userProfile.status)) {
            this.props.getProfile(this.props.receiverId, false);
        }
    }

    static getDerivedStateFromProps(nextProps) {
        return {
            profiles: nextProps.profiles,
        }
    }


    componentDidUpdate(_prevProps, _prevState, _snapshot) {
        if (this.props.receiverId in this.props.profiles && this.props.profiles[this.props.receiverId] !== this.state.userProfile) {
            this.setState({
                userProfile: this.props.profiles[this.props.receiverId],
            });
        }
    }

    getDisplayName = () => this.state.userProfile.name !== "" ? this.state.userProfile.name : "Invibe user " + this.props.receiverId;

    goToProfile = () => {
        this.props.navigation.push("Profile", {userId: this.props.receiverId});
    }

    render() {
        const receiverProfileImageDimension = Dimensions.get('window').width / 7.5;
        const spaceBetween = Dimensions.get('window').width / 50;
        const onPress = "onPress" in this.props ? this.props.onPress : this.goToProfile;
        return (
            <View style={{
                flexDirection: "row",
                alignItems: 'center',
                justifyContent: "flex-end",
                width: Dimensions.get('window').width / 1.4,
            }}>
                <TouchableWithoutFeedback onPress={onPress}>
                    <Text style={{
                        fontSize: 23,
                        marginRight: spaceBetween,
                        textAlignVertical: "center",
                        color: chatSelectedColour,
                        fontWeight: 'bold',
                    }}>{this.getDisplayName()} </Text>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback style={{
                    borderRadius: receiverProfileImageDimension,
                    backgroundColor: "black",
                    width: receiverProfileImageDimension,
                    height: receiverProfileImageDimension,
                }} onPress={onPress}>
                    <Image source={this.state.userProfile.profileImage}
                           style={{
                               width: receiverProfileImageDimension,
                               height: receiverProfileImageDimension,
                               borderRadius: receiverProfileImageDimension
                           }}
                           resizeMode={"cover"}/>
                </TouchableWithoutFeedback>
            </View>
        );
    }
}

const mapStateToProps = state => ({
    profiles: state.profile.profiles,
});

export default connect(mapStateToProps, {getProfile})(ChatHeader);