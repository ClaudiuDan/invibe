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
import {addChat, deleteChat, getChatsList} from "../redux/actions/ChatAction";
import {chatColour, styles} from "../chat/styles/ChatsScreenStyles";
import {connectActionSheet} from "@expo/react-native-action-sheet";
import ChatHeader from "../chat/components/ChatHeader";


class ChatsScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,
            receiverId: '',
            chatsList: this.props.chatsList,
        }
    }

    componentDidMount() {
        setTimeout(() => this.props.getChatsList(), 300);
    }

    static getDerivedStateFromProps(nextProps) {
        return {
            chatsList: nextProps.chatsList,
        }
    }


    componentDidUpdate(_prevProps, _prevState, _snapshot) {
        if (this.props.chatsList !== this.state.chatsList) {
            this.setState({
                chatsList: this.props.chatsList,
            })
        }
    }

    setModalVisible = (visible) => {
        this.setState({modalVisible: visible});
    };

    onReceiverIdChanged(text) {
        this.setState({receiverId: text});
    }

    openActionSheetDeleteChat = (chat) => {
        const options = ['Delete'];
        const destructiveButtonIndex = 0;
        const cancelButtonIndex = 1;

        this.props.showActionSheetWithOptions(
            {
                options,
                destructiveButtonIndex,
                cancelButtonIndex
            },
            buttonIndex => {
                if (buttonIndex === destructiveButtonIndex) {
                    this.props.deleteChat(chat);
                }
            },
        );
    };
    render() {
        const {modalVisible, chatsList} = this.state;
        //TODO bind to state
        let matchesList = this.props.matchesList
        console.log(matchesList.matchesInfo)
        return (
            <View>
                {this.getModalView(modalVisible)}
                <Button
                    title="New chat"
                    color={chatColour}
                    onPress={() => {
                        this.setModalVisible(true);
                    }}
                />
                <ScrollView style={styles.scrollView}>
                    {this.getChatsListComponent(chatsList.chatsInfo)}
                </ScrollView>
                <ScrollView style={styles.scrollView}>
                    {this.getMatchesListComponent(matchesList.matchesInfo)}
                </ScrollView>
                <Button
                    title="Go back"
                    color={chatColour}
                    onPress={() => this.props.navigation.navigate('Home')}
                />
            </View>
        );
    }

    getChatsListComponent(chatsInfo) {
        const chatsEntries = [];
        const chats = [];
        for (const receiver in chatsInfo) {
            chats.push(chatsInfo[receiver]);
        }
        chats.sort((c1, c2) => c2.ord - c1.ord).forEach((chatInfo, index) => chatsEntries.push((
            <TouchableWithoutFeedback
                key={index}
                style={styles.chatTouchable}
                onPress={() => this.props.navigation.navigate('Chat', {receiverId: chatInfo.receiver})}
                onLongPress={() => this.openActionSheetDeleteChat(chatInfo)}
            >
                <View style={styles.chatView}>
                    {/*<Text style={styles.chatViewText}>*/}
                    {/*    {"Chat with " + chatInfo.receiver}*/}
                    {/*</Text>*/}
                    <ChatHeader receiverId={chatInfo.receiver}
                                //TODO: remove this?
                                navigation={this.props.navigation}
                                onPress={() => this.props.navigation.navigate('Chat', {receiverId: chatInfo.receiver})}
                    />
                    <View style={{paddingBottom: 10}}/>
                </View>
            </TouchableWithoutFeedback>
        )));

        return chatsEntries;
    }

    getMatchesListComponent(matchesInfo) {
        const matchesEntries = [];
        const matchesAsList = [];
        for (const matchInfo in matchesInfo) {
            matchesAsList.push(matchesInfo[matchInfo]);
        }
        matchesAsList.sort((c1, c2) => c2.ord - c1.ord).forEach((matchInfo) => matchesEntries.push((
            //TODO: change TouchableWithoutFeedback, docs suggest to use it only if we really need to
            <TouchableWithoutFeedback
                key={matchInfo.receiver}
                style={styles.chatTouchable}
                onPress={() => this.props.navigation.push("Profile", {userId: matchInfo.receiver})}
            >
                <View style={styles.chatView}>
                    <ChatHeader receiverId={matchInfo.receiver}
                                navigation={this.props.navigation}
                                onPress={() => this.props.navigation.push("Profile", {userId: matchInfo.receiver})}
                    />
                    <View style={{paddingBottom: 10}}/>
                </View>
            </TouchableWithoutFeedback>
        )));

        return matchesEntries;
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
                            onChangeText={this.onReceiverIdChanged.bind(this)}
                        />
                        <View style={{flexDirection: "row", justifyContent: 'space-between'}}>
                            <TouchableHighlight
                                style={{
                                    ...styles.openButton,
                                    backgroundColor: chatColour,
                                    margin: 10,
                                    width: '30%'
                                }}
                                onPress={() => {
                                    this.setModalVisible(!modalVisible);
                                    this.props.addChat(this.state.receiverId);
                                    setTimeout(() => this.props.navigation.navigate('Chat', {receiverId: this.state.receiverId}), 100);
                                }}
                            >
                                <Text style={styles.textStyle}>Go</Text>
                            </TouchableHighlight>
                            <TouchableHighlight
                                style={{
                                    ...styles.openButton,
                                    backgroundColor: chatColour,
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
    matchesList: state.match.matchesList,
    //TODO: do we need this?
    ws: state.chat.webSocket,
});

export default connect(mapStateToProps, {getChatsList, addChat, deleteChat})(connectActionSheet(ChatsScreen));