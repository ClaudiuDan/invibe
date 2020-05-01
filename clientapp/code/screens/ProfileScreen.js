import React, {Component} from 'react';
import {Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {chatColour} from "../chat/styles/ChatsScreenStyles";


const profileImage = [{
    uri: 'https://img5.goodfon.com/wallpaper/nbig/8/2a/emmy-rossum-aktrisa-vzgliad-portret.jpg'
},];


const albumImages = [
    {
        uri: 'https://c4.wallpaperflare.com/wallpaper/740/259/689/emmy-rossum-26-wallpaper-preview.jpg'
    },
    {
        uri: "https://c4.wallpaperflare.com/wallpaper/58/848/937/emmy-rossum-actress-girl-wallpaper-preview.jpg"
    },
    {
        uri: "https://img5.goodfon.com/wallpaper/nbig/1/4c/emmy-rossum-aktrisa-portret.jpg"
    }
];

class ProfileScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            profileImageOpened: true
        }
    }

    render() {
        return (<ScrollView>
                <View style={styles.container}>
                    <View style={styles.header}/>
                    <TouchableOpacity style={styles.avatar}
                                      onPress={() => this.props.navigation.push('ImagesViewer', {
                                          images: profileImage,
                                          imageIndex: 0
                                      })}
                    >
                        <Image
                            source={{uri: 'https://img5.goodfon.com/wallpaper/nbig/8/2a/emmy-rossum-aktrisa-vzgliad-portret.jpg'}}
                            style={styles.avatarImage}
                            resizeMode={"cover"}
                        />
                    </TouchableOpacity>

                    <View style={styles.body}>
                        <View style={styles.bodyContent}>
                            <Text style={styles.name}>Emmy Rossum</Text>
                            <Text style={styles.info}>Actor / US / 33</Text>
                            <Text style={styles.description}>Lorem ipsum dolor sit amet, saepe sapientem eu nam. Qui ne
                                assum electram expetendis, omittam deseruisse consequuntur ius an,</Text>

                            <View style={{marginTop: 32}}>
                                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                                    {albumImages.map((img, index) => (
                                        <TouchableOpacity key={index}
                                                          activeOpacity={1}
                                                          style={styles.mediaImageContainer}
                                                          onPress={() => this.props.navigation.navigate('ImagesViewer', {
                                                              images: albumImages,
                                                              imageIndex: index
                                                          })}
                                        >
                                            <Image
                                                source={{uri: img.uri}}
                                                style={styles.image} resizeMode="cover"/>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

        );
    }
}

export default ProfileScreen;

const styles = StyleSheet.create({
    header: {
        backgroundColor: chatColour,
        height: 170,
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
        fontWeight: "600"
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
        marginHorizontal: 10
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

