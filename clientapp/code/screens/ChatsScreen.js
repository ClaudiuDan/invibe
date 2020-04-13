import React, {Component} from 'react';
import {
    Button,
    View,
    Modal,
    TouchableHighlight,
    Text,
    StyleSheet,
    TextInput,
    ScrollView,
    TouchableWithoutFeedback
} from "react-native";


class ChatsScreen extends Component {

    state = {
        modalVisible: false,
        userId: '',
    };

    setModalVisible = (visible) => {
        this.setState({modalVisible: visible});
    };

    onUserIdChanged(text) {
        this.setState({userId: text});
    }

    render() {
        const {modalVisible} = this.state;
        return (
            <View>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                >
                    <TouchableWithoutFeedback onPress={() => this.setModalVisible(!modalVisible)}>
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <TextInput
                                    style={styles.modalText}
                                    placeholder='User Id'
                                    onChangeText={this.onUserIdChanged.bind(this)}
                                />
                                <View style={{flexDirection: "row", justifyContent: 'space-between'}}>
                                    <TouchableHighlight
                                        style={{
                                            ...styles.openButton,
                                            backgroundColor: "#2196F3",
                                            margin: 10,
                                            width: '30%'
                                        }}
                                        onPress={() => {
                                            this.setModalVisible(!modalVisible);
                                            this.props.navigation.navigate('U2UChat', {userId: this.state.userId});
                                        }}
                                    >
                                        <Text style={styles.textStyle}>Go</Text>
                                    </TouchableHighlight>
                                    <TouchableHighlight
                                        style={{
                                            ...styles.openButton,
                                            backgroundColor: "#2196F3",
                                            margin: 10,
                                            width: '30%'
                                        }}
                                        onPress={() => {
                                            this.setModalVisible(!modalVisible);
                                        }}
                                    >
                                        <Text style={styles.textStyle}>Hide</Text>
                                    </TouchableHighlight>
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
                <Button
                    title="New chat"
                    onPress={() => {
                        this.setModalVisible(true);
                    }}
                />
                <Button
                    title="Go back"
                    onPress={() => this.props.navigation.navigate('Home')}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
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
});

export default ChatsScreen;