import React, {Component} from 'react';
import {
    ActivityIndicator,
    Image,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import {Icon} from "react-native-elements";
import ImagePickerView from "../profile/ImageCameraOrGalleryPickerForProfile";
import {connectActionSheet} from "@expo/react-native-action-sheet";
import {connect} from "react-redux";
import PROFILE_IMAGE_PLACEHOLDER from "../../assets/profile-image-placeholder.png"
import {isObjectEmpty} from "../Utils/Utils";
import {styles} from "../profile/ProfileScreenStyles";
import {getProfile, getProfileAlbumImages, updateProfile, updateProfileStatus} from "../redux/actions/ProfileAction";
import UserProfile from "../profile/UserProfile";
import {profileStatus} from "../profile/ProfileStatus";

class ProfileScreen extends Component {

    constructor(props) {
        super(props);

        const userId = this.props.route.params.userId;
        const userProfile = userId in this.props.profiles ? this.props.profiles[userId] : new UserProfile(userId);

        this.state = {
            userId: userId,
            userProfile: userProfile,

            name: userProfile.name,
            shortDescription: userProfile.shortDescription,
            longDescription: userProfile.longDescription,
            profileImage: userProfile.profileImage,
            albumImages: userProfile.albumImages,

            editMode: false,
            editModeChanges: {}, // Preparing the data to be send as a post http request
        };
    }


    componentDidMount() {
        if ([profileStatus.UNLOADED, profileStatus.ERROR].includes(this.state.userProfile.status)) {
            this.props.getProfile(this.state.userId, true);
        } else if ([profileStatus.UNLOADED, profileStatus.ERROR].includes(this.state.userProfile.albumStatus)) {
            this.props.getProfileAlbumImages(this.state.userId);
        }
    }

    static getDerivedStateFromProps(nextProps) {
        return {
            profiles: nextProps.profiles,
        }
    }


    componentDidUpdate(_prevProps, _prevState, _snapshot) {
        if (this.state.userId in this.props.profiles && this.props.profiles[this.state.userId] !== this.state.userProfile) {
            const userProfile = this.props.profiles[this.state.userId];
            this.setState({
                userProfile: userProfile,
                name: userProfile.name,
                shortDescription: userProfile.shortDescription,
                longDescription: userProfile.longDescription,
                profileImage: userProfile.profileImage,
                albumImages: userProfile.albumImages,
            });
        }
    }

    editButtonPressed = () => this.setState({editMode: true, editModeChanges: {}});

    saveButtonPressed = () => {

        if (isObjectEmpty(this.state.editModeChanges)) {
            this.setState({editMode: false, editModeChanges: {}});
            return;
        }

        this.props.updateProfile(this.state.userId, this.state.editModeChanges, this.state);
    };

    onNameTextChanged = (text) => {
        this.setState({
            name: text,
            editModeChanges: {...this.state.editModeChanges, name: text}
        });
    };

    onShortDescriptionTextChanged = (text) => this.setState({
        shortDescription: text,
        editModeChanges: {...this.state.editModeChanges, short_description: text}
    });

    onLongDescriptionTextChanged = (text) => this.setState({
        longDescription: text,
        editModeChanges: {...this.state.editModeChanges, long_description: text}
    });

    getEditProfileButton = () => {
        if (this.state.userProfile.status === profileStatus.SAVING) {
            return (
                <View style={styles.editButton}>
                    <ActivityIndicator size="large" color={"#bababa"}/>
                </View>
            );
        }
        return this.props.route.params.editable ?
            ((!this.state.editMode) ?
                <View style={styles.editButton}>
                    <Icon
                        reverse
                        name='edit'
                        type='feather'
                        size={20}
                        color={"#bababa"}
                        onPress={this.editButtonPressed}
                    />
                </View> :
                <View style={styles.editButton}>
                    <Icon
                        reverse
                        name='save'
                        type='feather'
                        size={20}
                        color={"#bababa"}
                        onPress={this.saveButtonPressed}
                    />
                </View>) :
            <></>;
    };

    getEditProfileImageButton = () => {
        return this.state.editMode ?
            <View style={styles.editProfileImageButton}>
                <ImagePickerView
                    onPress={(uri, base64Content, imageExtension) => {
                        this.setState({
                            profileImage: {uri: uri},
                            editModeChanges: {
                                ...this.state.editModeChanges,
                                profile_image: base64Content,
                                profile_image_extension: imageExtension
                            }
                        })
                    }}
                />
            </View> :
            <></>;
    };

    getAddAlbumImageButton = () => {
        return this.state.editMode ?
            <View style={styles.addAlbumImageButton}>
                <ImagePickerView
                    onPress={(uri, base64Content, imageExtension) => {
                        const album_images = "album_images" in this.state.editModeChanges ?
                            this.state.editModeChanges["album_images"] : [];

                        this.setState({
                            albumImages: [...this.state.albumImages, {uri: uri}],
                            editModeChanges: {
                                ...this.state.editModeChanges,
                                album_images: [...album_images, {
                                    created_timestamp: Date.now(),
                                    image_extension: imageExtension,
                                    image_content: base64Content
                                }],
                            }
                        })
                    }}
                />
            </View> :
            <></>;
    };

    openDeleteProfileImage = () => {
        if (!this.state.editMode) {
            return;
        }

        const options = ['Delete'];
        const destructiveButtonIndex = 0;
        const cancelButtonIndex = 1;

        this.props.showActionSheetWithOptions(
            {
                options,
                destructiveButtonIndex,
                cancelButtonIndex,
            },
            buttonIndex => {
                if (buttonIndex === 0) {
                    this.setState({
                        profileImage: PROFILE_IMAGE_PLACEHOLDER,
                        editModeChanges: {...this.state.editModeChanges, delete_profile_image: true}
                    })
                }
            },
        );
    };

    openDeleteAlbumImage = (index) => {
        if (!this.state.editMode) {
            return;
        }

        const options = ['Delete'];
        const destructiveButtonIndex = 0;
        const cancelButtonIndex = 1;

        this.props.showActionSheetWithOptions(
            {
                options,
                destructiveButtonIndex,
                cancelButtonIndex,
            },
            buttonIndex => {
                if (buttonIndex === 0) {
                    const delete_album_images = "delete_album_images" in this.state.editModeChanges ?
                        this.state.editModeChanges["delete_album_images"] : [];
                    const created_timestamp = this.state.albumImages[index].createdTimestamp;

                    this.setState({
                        albumImages: [...this.state.albumImages.slice(0, index), ...this.state.albumImages.slice(index + 1)],
                        editModeChanges: {
                            ...this.state.editModeChanges,
                            delete_album_images: [...delete_album_images, {created_timestamp: created_timestamp}],
                        },
                    })
                }
            },
        );
    };

    getAlbumImagesComponent() {
        if (this.state.userProfile.albumStatus === profileStatus.LOADING) {
            return (
                <ActivityIndicator style={{alignSelf: "center"}} size="large" color={"#bababa"}/>
            )
        }
        if ([profileStatus.ERROR, profileStatus.UNLOADED].includes(this.state.userProfile.albumStatus)) {
            return (<View style={{alignSelf: "center"}}>
                <Text> Couldn't load the album, please try again</Text>
                <View style={{paddingTop: "3%", alignItems: "center"}}>
                    <Icon
                        reverse
                        style={{alignSelf: "center"}}
                        name='refresh-cw'
                        type='feather'
                        size={20}
                        color={"#bababa"}
                        onPress={() => this.props.getProfileAlbumImages(this.state.userId)}
                    />
                </View>
            </View>);
        }

        return (<>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                {this.state.albumImages.map((img, index) => (
                    <TouchableOpacity key={index}
                                      activeOpacity={1}
                                      style={styles.mediaImageContainer}
                                      onPress={() => this.props.navigation.navigate('ImagesViewer', {
                                          images: this.state.albumImages,
                                          imageIndex: index
                                      })}
                                      onLongPress={() => this.openDeleteAlbumImage(index)}
                    >
                        <Image
                            source={{uri: img.uri}}
                            style={styles.image} resizeMode="cover"/>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            {this.getAddAlbumImageButton()}
        </>);
    }

    render() {

        if (this.state.userProfile.status === profileStatus.LOADING) {
            return (
                <ActivityIndicator style={{paddingTop: "50%", alignSelf: "center"}} size="large" color={"#bababa"}/>
            )
        }

        if ([profileStatus.ERROR, profileStatus.UNLOADED].includes(this.state.userProfile.status)) {
            return (
                <View style={{paddingTop: "50%", alignSelf: "center"}}>
                    <Text> Couldn't load profile, please try again</Text>
                    <Icon
                        reverse
                        name='refresh-cw'
                        type='feather'
                        size={20}
                        color={"#bababa"}
                        onPress={() => this.props.getProfile(this.state.userId, true)}
                    />
                </View>
            )
        }

        const textInputEditModeStyle = this.state.editMode ? {
            borderWidth: 0.5,
            borderColor: "black",
        } : {
            borderWidth: 0.5,
            borderColor: "transparent"
        };

        return (<ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={false}
                        onRefresh={() => this.props.getProfile(this.state.userId, true)}
                    />
                }
            >
                <View style={styles.header}/>
                {this.getEditProfileButton()}
                <TouchableOpacity style={styles.avatar}
                                  onPress={() => this.props.navigation.push('ImagesViewer', {
                                      images: [this.state.profileImage],
                                      imageIndex: 0
                                  })}
                                  onLongPress={this.openDeleteProfileImage}
                >
                    <Image
                        source={this.state.profileImage}
                        style={styles.avatarImage}
                        resizeMode={"cover"}
                    />
                </TouchableOpacity>
                {this.getEditProfileImageButton()}
                <View style={styles.body}>
                    <View style={styles.bodyContent}>
                        <TextInput maxLength={40} style={[styles.name, textInputEditModeStyle]}
                                   editable={this.state.editMode} value={this.state.name}
                                   ref={input => {
                                       this.nameTextInput = input
                                   }}
                                   placeholder={"Name"}
                                   onChangeText={this.onNameTextChanged}/>
                        <TextInput maxLength={70} style={[styles.info, textInputEditModeStyle]}
                                   editable={this.state.editMode} value={this.state.shortDescription}
                                   ref={input => {
                                       this.shortDescriptionTextInput = input
                                   }}
                                   placeholder={"Short description"}
                                   onChangeText={this.onShortDescriptionTextChanged}/>
                        <TextInput style={[styles.description, textInputEditModeStyle]}
                                   multiline={true}
                                   editable={this.state.editMode}
                                   maxLength={250}
                                   value={this.state.longDescription}
                                   ref={input => {
                                       this.longDescriptionTextInput = input
                                   }}
                                   placeholder={"Long description"}
                                   onChangeText={this.onLongDescriptionTextChanged}/>

                        <View style={{marginTop: "7%", alignSelf: "stretch"}}>
                            <View
                                style={{
                                    alignSelf: "stretch",
                                    borderBottomColor: 'black',
                                    borderBottomWidth: 0.5,
                                    marginBottom: "5%",
                                }}
                            />
                            {this.getAlbumImagesComponent()}
                        </View>
                    </View>
                </View>
            </ScrollView>

        );
    }
}

const mapStateToProps = state => ({
    profiles: state.profile.profiles,
});

export default connect(mapStateToProps, {
    getProfile,
    getProfileAlbumImages,
    updateProfile,
    updateProfileStatus
})(connectActionSheet(ProfileScreen));

