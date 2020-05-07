import {StyleSheet} from "react-native";
import {chatColour} from "../chat/styles/ChatsScreenStyles";

export const styles = StyleSheet.create({
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