import React, {Component} from 'react';
import {Button, Switch, Text, View} from "react-native";
import {connect} from "react-redux";
import {signOut, socialConnect} from "../redux/actions/AuthAction";
import {handleFacebookSocialRequest} from "../Utils/SocialUtils"
import {genders, profileStatus} from "../profile/ProfileStatus";
import UserProfile from "../profile/UserProfile";
import {getProfile, updateProfile} from "../redux/actions/ProfileAction";

class SettingsScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            userProfile: this.props.userId in this.props.profiles ? this.props.profiles[this.props.userId] : new UserProfile(this.props.userId)
        }
    }

    componentDidMount() {
        if ([profileStatus.UNLOADED, profileStatus.ERROR].includes(this.state.userProfile.status)) {
            this.props.getProfile(this.props.userId, false);
        }
    }

    static getDerivedStateFromProps(nextProps) {
        return {
            profiles: nextProps.profiles,
        }
    }


    componentDidUpdate(_prevProps, _prevState, _snapshot) {
        if (this.props.userId in this.props.profiles && this.props.profiles[this.props.userId] !== this.state.userProfile) {
            this.setState({
                userProfile: this.props.profiles[this.props.userId],
            });
        }
    }

    render() {
        return (
            <View>
                <Button
                    title="Go back"
                    onPress={() => this.props.navigation.navigate('Home')}
                />
                <Button
                    title="Connect Facebook"
                    onPress={() => handleFacebookSocialRequest(this.props.socialConnect)}
                />
                <View style={{
                    padding: 20,
                    flexDirection: "row",
                    alignSelf: "center",
                }}>
                    <Text style={{fontSize: 20}}>{genders.MALE}</Text>
                    <Switch
                        trackColor={{false: "#767577", true: "#81b0ff"}}
                        thumbColor={"#f4f3f4"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={() => {
                            const gender = this.state.userProfile.gender === genders.FEMALE ? genders.MALE : genders.FEMALE;
                            this.props.updateProfile(this.props.userId, {gender: gender}, {gender: gender})
                        }}
                        value={this.state.userProfile.gender === genders.FEMALE}
                    />
                    <Text style={{fontSize: 20}}>{genders.FEMALE}</Text>
                </View>
                {/*<Button title={"Change gender to male"} onPress={() => {*/}
                {/*    this.props.updateProfile(this.props.userId, {gender: "F"}, {gender: "F"})*/}
                {/*}}/>*/}
                <View style={{paddingTop: "50%", alignItems: "center"}}>
                    <Text>{"Logged in as " + this.props.userId}</Text>
                    <View style={{height: 10}}/>
                    <Button
                        title="Sign Out"
                        onPress={() => this.props.signOut()}
                    />
                </View>
            </View>
        );
    }
}

const mapStateToProps = state => ({
    profiles: state.profile.profiles,
    userId: state.auth.userId,
});

export default connect(mapStateToProps, {signOut, socialConnect, getProfile, updateProfile})(SettingsScreen);