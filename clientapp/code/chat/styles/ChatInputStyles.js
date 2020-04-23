import {StyleSheet} from "react-native";
import {chatColour} from "./ChatsScreenStyles";

export const chatInputStyles = StyleSheet.create({

    //ChatView

    outer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: 'white'
    },

    messages: {
        flex: 1,
    },

    //InputBar

    inputBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 5,
        paddingVertical: 3,
    },

    textBox: {
        borderRadius: 20,
        borderWidth: 1,
        alignItems: "center",
        borderColor: 'gray',
        height: '50%',
        flex: 1,
        fontSize: 17,
        paddingHorizontal: 10
    },

    sendButton: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 15,
        marginLeft: 5,
        paddingRight: 15,
        borderRadius: 20,
        backgroundColor:  chatColour
    },

    //MessageBox

    messageBubble: {
        borderRadius: 20,
        marginTop: 8,
        marginRight: 10,
        marginLeft: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
        flexDirection: 'row',
        flex: 1
    },

    messageBubbleLeft: {
        backgroundColor: '#d5d8d4',
    },

    messageBubbleTextLeft: {
        color: 'black'
    },

    messageBubbleRight: {
        backgroundColor: chatColour
    },

    messageBubbleTextRight: {
        color: 'white'
    },
});