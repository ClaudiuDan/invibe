import React, {Component} from 'react';
import {
    Button,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableHighlight,
    TouchableWithoutFeedback,
    View
} from "react-native";
import {connect} from "react-redux";
import {addChat, deleteChat, getChatsList, openWebSocketForChat} from "../redux/actions/ChatAction";
import {styles} from "../chat/styles/ChatsScreenStyles";


class ChatsScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            modalVisible: false,
            userId: '',
            chatsList: [],
            webSockets: {},
        }
    }

    componentDidMount() {
        this.props.getChatsList();

        setTimeout(() => this.state.chatsList.forEach(chat => {
            if (!([chat.receiver.toString()] in this.state.webSockets)) {
                this.props.openWebSocketForChat(chat.receiver.toString());
            }
        }), 500);
    }

    static getDerivedStateFromProps(nextProps) {
        return {
            chatsList: nextProps.chatsList,
            webSockets: nextProps.webSockets,
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.chatsList !== this.state.chatsList || this.props.webSockets !== this.state.webSockets) {
            this.setState({
                chatsList: this.props.chatsList,
                webSockets: this.props.webSockets,
            })
        }
    }

    setModalVisible = (visible) => {
        this.setState({modalVisible: visible});
    };

    onUserIdChanged(text) {
        this.setState({userId: text});
    }

    render() {
        const {modalVisible, chatsList} = this.state;
        return (
            <View>
                {this.getModalView(modalVisible)}
                <Button
                    title="New chat"
                    onPress={() => {
                        this.setModalVisible(true);
                    }}
                />
                <ScrollView style={styles.scrollView}>
                    {chatsList.map((chat) => {
                        return (
                            <View style={styles.chatAndDeleteButton} key={chat.id}>
                                <TouchableWithoutFeedback
                                    style={styles.chatTouchable}
                                    onPress={() => this.props.navigation.navigate('Chat', {userId: chat.receiver})}
                                >
                                    <View style={styles.chatView}>
                                        <Text style={styles.chatViewText}>
                                            {"Chat with " + chat.receiver}
                                        </Text>
                                    </View>
                                </TouchableWithoutFeedback>
                                <TouchableWithoutFeedback
                                    style={{backgroundColor: "#000"}}
                                    onPress={() => this.props.deleteChat(chat.id)}>
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

    // Shows the new chat dialog
    getModalView(modalVisible) {
        return <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}>
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
                                    this.props.addChat(this.state.userId);
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
        </Modal>;
    }
}

const mapStateToProps = state => ({
    chatsList: state.chat.chatsList,
    webSockets: state.chat.webSockets,
});

export default connect(mapStateToProps, {getChatsList, addChat, deleteChat, openWebSocketForChat})(ChatsScreen);