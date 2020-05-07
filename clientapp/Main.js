import React, {Component} from 'react';
import {NavigationContainer} from "@react-navigation/native";
import {
    ChatsScreen,
    HomeScreen,
    LoginScreen,
    ProfileScreen,
    RegisterScreen,
    SettingsScreen,
    U2UChatScreen
} from "./code/screens/exports";
import {connect} from "react-redux";
import {createStackNavigator} from "@react-navigation/stack";
import {Text, View} from "react-native";
import {restoreToken, restoreUserId} from "./code/redux/actions/AuthAction";
import {ActionSheetProvider} from "@expo/react-native-action-sheet";
import ImagesViewerScreen from "./code/screens/ImagesViewerScreen";
import ChatHeader from "./code/chat/components/ChatHeader";


class Main extends Component {

    componentDidMount() {
        this.setState({userToken: null});
        this.setState({isLoading: false});
        this.props.restoreToken();
        this.props.restoreUserId();
    }

    render() {
        if (this.props.isLoading) {
            // We haven't finished checking for the token yet
            return (
                <View style={{alignSelf: "stretch", paddingTop: "50%"}}>
                    <Text style={{fontSize: 64, alignSelf: "center"}}>
                        Loading
                    </Text>
                </View>
            );
        }
        const Stack = createStackNavigator();
        return (
            <ActionSheetProvider>
                <NavigationContainer>
                    <Stack.Navigator>
                        {this.props.userToken == null ? (
                            <>
                                <Stack.Screen name="Login" component={LoginScreen}/>
                                <Stack.Screen name="Register" component={RegisterScreen}/>
                            </>
                        ) : (
                            <>
                                <Stack.Screen
                                    name="Home"
                                    component={HomeScreen}
                                    options={{title: 'Welcome'}}
                                />
                                <Stack.Screen name="Profile" component={ProfileScreen}/>
                                <Stack.Screen name="Chats" component={ChatsScreen}/>
                                <Stack.Screen name="Chat" component={U2UChatScreen}
                                              options={({route, navigation}) => ({
                                                  headerTitle: props => <ChatHeader {...props}
                                                                                    receiverId={route.params.receiverId}
                                                                                    navigation={navigation}/>,
                                              })}/>
                                <Stack.Screen name="Settings" component={SettingsScreen}/>
                                <Stack.Screen name="ImagesViewer" component={ImagesViewerScreen}
                                              options={() => ({
                                                  headerShown: false,
                                                  cardStyle: {backgroundColor: 'transparent'}
                                              })}
                                />
                            </>
                        )}
                    </Stack.Navigator>
                </NavigationContainer>
            </ActionSheetProvider>
        )
    }
}


const mapStateToProps = state => ({
    isLoading: state.auth.isLoading,
    userToken: state.auth.userToken,
});

export default connect(mapStateToProps, {restoreToken, restoreUserId})(Main);
