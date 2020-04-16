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
import Axios from "axios";
import update from 'immutability-helper';


class ChatsScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            modalVisible: false,
            userId: '',
            chats: [],
        }
    }

    componentDidMount() {
        Axios
            .get(`/chat/active_chats/`)
            .then(response => {
                const chats = [];
                JSON.parse(response.data).chats
                    .forEach(chat => {
                        chats.push({
                            id: chat.id,
                            receiver: chat.receiver
                        })
                    })

                this.setState(
                    {chats: chats}
                )
            })
            .catch(error => console.log(error));
    }

    setModalVisible = (visible) => {
        this.setState({modalVisible: visible});
    };

    onUserIdChanged(text) {
        this.setState({userId: text});
    }

    render() {
        const {modalVisible, chats} = this.state;
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
                                            Axios
                                                .post(`/chat/active_chats/`, {receiver: this.state.userId})
                                                .then(response => {
                                                        const chat = JSON.parse(response.data);
                                                        this.setState({
                                                            chats: [...chats, {
                                                                id: chat.id,
                                                                receiver: chat.receiver,
                                                            }]
                                                        })
                                                    }
                                                )
                                                .catch(error => console.log(error));
                                            this.props.navigation.navigate('Chat', {userId: this.state.userId});
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
                <ScrollView style={styles.scrollView}>
                    {chats.map((chat, chatIndex) => {
                        return (
                            <View style={styles.chatAndDeleteButton}>
                                <TouchableWithoutFeedback
                                    style={styles.chatTouchable}
                                    onPress={() => this.props.navigation.navigate('Chat', {userId: chat.receiver})}
                                    onLongPress={() => console.log("Long press")}
                                >
                                    <View style={styles.chatView}>
                                        <Text style={styles.chatViewText}>
                                            {"Chat with " + chat.receiver}
                                        </Text>
                                    </View>
                                </TouchableWithoutFeedback>
                                <TouchableWithoutFeedback
                                    style={{backgroundColor: "#000"}}
                                    onPress={() => {
                                        this.setState({
                                            chats: update(this.state.chats, {$splice: [[chatIndex, 1]]})
                                        });

                                        Axios
                                            .delete(`/chat/active_chats/`, {params: {id: chat.id}})
                                            .catch(error => console.log(error));
                                    }}>
                                    <Text style={{fontSize: 20}}> {"X"} </Text>
                                </TouchableWithoutFeedback>
                            </View>
                        )
                    })}
                </ScrollView>
                <Button
                    title="Go back"
                    onPress={() => this.props.navigation.navigate('Home')}
                />
            </View>
        );
    }
}

//TODO: separate these out.
const styles = StyleSheet.create({
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

export default ChatsScreen;