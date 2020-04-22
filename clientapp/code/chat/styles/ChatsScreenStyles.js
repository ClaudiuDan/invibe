import {StyleSheet} from "react-native";

export const chatColour = "#517fa4";
export const chatSelectedColour = "#233346";

export const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },

    chatAndDeleteButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },

    openButton: {
        backgroundColor: "#F194FF",
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },

    modalText: {
        marginBottom: 15,
        fontSize: 25,
        textAlign: "center"
    },

    textStyle: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center"
    },

    scrollView: {
        margin: 20,
        maxHeight: "60%",
    },

    chatView: {
        flex: 1,
        margin: 10,
        alignItems: "center",
        borderBottomWidth: 0.5,
    },

    chatTouchable: {
        width: "100%",
    },

    chatViewText: {
        flex: 1,
        justifyContent: "center",
        fontSize: 20,
    }
});