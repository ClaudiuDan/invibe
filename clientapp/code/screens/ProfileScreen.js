import React, {Component} from 'react';
import {ActivityIndicator, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import {chatColour} from "../chat/styles/ChatsScreenStyles";
import {Icon} from "react-native-elements";
import ImagePickerView from "../profile/ImageCameraOrGalleryPickerForProfile";
import {connectActionSheet} from "@expo/react-native-action-sheet";
import PROFILE_IMAGE_PLACEHOLDER from "../../assets/profile-image-placeholder.png"
import Axios from "axios";
import {isObjectEmpty} from "../Utils/Utils";

// TODO: Refactor this such that the current user profile can be cached in redux
class ProfileScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            profileImageOpened: true,
            editMode: false,
            profileImage: PROFILE_IMAGE_PLACEHOLDER,
            albumImages: [],
            name: "",
            shortDescription: "",
            longDescription: "",
            editModeChanges: {}, // Preparing the data to be send as a post http request
            savingInProgress: false,
            loadingProfile: true,
        };
    }


    componentDidMount() {
        Axios
            .get(`/profile/`, {params: {user_id: this.props.route.params.userId, with_album_images: true}})
            .then(response => {
                const parsedData = JSON.parse(response.data);

                const profileImage = "profile_image" in parsedData ?
                    {uri: `data:image/${parsedData.profile_image_extension};base64,${parsedData.profile_image}`} :
                    PROFILE_IMAGE_PLACEHOLDER;

                const albumImages = parsedData.album_images.map(image => {
                    return {
                        uri: `data:image/${image.image_extension};base64,${image.image}`,
                        createdTimestamp: image.created_timestamp,
                    };
                });

                this.setState({
                    name: parsedData.name,
                    shortDescription: parsedData.short_description,
                    longDescription: parsedData.long_description,
                    profileImage: profileImage,
                    albumImages: albumImages,
                    loadingProfile: false,
                });
            })
            .catch(error => {
                console.log("Could not get user profile from server", this.props.route.params.userId, error);
                console.log(error.content);
                this.setState({loadingProfile: false}); //TODO: better error handling here
            });
    }

    editButtonPressed = () => this.setState({editMode: true, editModeChanges: {}});

    saveButtonPressed = () => {

        if (isObjectEmpty(this.state.editModeChanges)) {
            this.setState({editMode: false, editModeChanges: {}, savingInProgress: false});
            return;
        }

        this.setState({savingInProgress: true});

        console.log(this.state.editModeChanges);
        Axios
            .post(`/profile/`, this.state.editModeChanges)
            .then(_ => {
                this.setState({editMode: false, editModeChanges: {}, savingInProgress: false});
            }).catch(error => {
            console.log("Could not save the profile changes", error);
            this.setState({editMode: false, editModeChanges: {}, savingInProgress: false});
        });

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
        if (this.state.savingInProgress) {
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

    render() {

        if (this.state.loadingProfile) {
            return (
                <ActivityIndicator style={{paddingTop: "50%", alignSelf: "center"}} size="large" color={"#bababa"}/>
            )
        }

        const textInputEditModeStyle = this.state.editMode ? {
            borderWidth: 0.5,
            borderColor: "black",
        } : {
            borderWidth: 0.5,
            borderColor: "transparent"
        };

        return (<ScrollView>
                <View style={styles.container}>
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

                            <View style={{marginTop: 32, marginBottom: 20}}>
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
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

        );
    }
}

export default connectActionSheet(ProfileScreen);

const styles = StyleSheet.create({
    header: {
        backgroundColor: chatColour,
        height: 170,
    },
    editButton: {
        position: 'absolute',
        alignSelf: 'flex-end',
        marginRight: "5%",
        marginTop: "5%",
    },
    editProfileImageButton: {
        position: 'absolute',
        alignSelf: 'flex-end',
        marginRight: "40%",
        marginTop: "48%",
    },
    addAlbumImageButton: {
        position: 'absolute',
        alignSelf: 'flex-start',
        marginTop: "-5%",
        marginLeft: "-7%",
    },
    avatar: {
        width: 165,
        height: 170,
        borderRadius: 70,
        marginBottom: 10,
        alignSelf: 'center',
        position: 'absolute',
        marginTop: '12%'
    },
    body: {
        marginTop: 40,
    },
    bodyContent: {
        flex: 1,
        alignItems: 'center',
        padding: 30,
    },
    name: {
        fontSize: 28,
        color: "#696969",
        fontWeight: "600",
        minHeight: "15%",
    },
    info: {
        fontSize: 16,
        color: "#00BFFF",
        marginTop: 10
    },
    description: {
        fontSize: 16,
        color: "#696969",
        marginTop: 10,
        textAlign: 'center'
    },
    image: {
        height: '100%',
        width: '100%',
        borderWidth: 3,
        borderRadius: 30,
    },
    avatarImage: {
        height: '100%',
        width: '100%',
        borderRadius: 70,
        borderWidth: 3,
        borderColor: "white",
    },
    mediaImageContainer: {
        width: 180,
        height: 200,
        borderRadius: 12,
        overflow: "hidden",
        marginHorizontal: 10,
        alignContent: "center"
    },
    buttonContainer: {
        marginTop: 10,
        height: 45,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        width: 250,
        borderRadius: 30,
        backgroundColor: "#00BFFF",
    },
});

