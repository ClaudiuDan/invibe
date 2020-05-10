import React, {Component} from 'react';
import {Button, Switch, Text, View} from "react-native";
import {connect} from "react-redux";
import {signOut, socialConnect} from "../redux/actions/AuthAction";
import {handleFacebookSocialRequest} from "../Utils/SocialUtils"
import {genders, profileStatus} from "../profile/ProfileStatus";
import UserProfile from "../profile/UserProfile";
import {getProfile, updateProfile} from "../redux/actions/ProfileAction";
import * as Location from 'expo-location';

class SettingsScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            userProfile: this.props.userId in this.props.profiles ? this.props.profiles[this.props.userId] : new UserProfile(this.props.userId),
            locationRetrieved: false,
            location: {
                city: "",
                country: "",
                street: "",
                latitude: "",
                longitude: "",
            },
        }
    }

    componentDidMount() {
        if ([profileStatus.UNLOADED, profileStatus.ERROR].includes(this.state.userProfile.status)) {
            this.props.getProfile(this.props.userId, false);
        }
    }

    getLocationAfterPermissionGranted = () => {
        Location.getCurrentPositionAsync({}).then(r => {
            Location.reverseGeocodeAsync({latitude: r.coords.latitude, longitude: r.coords.longitude})
                .then(location => this.setState({
                    locationRetrieved: true,
                    location: {
                        city: location[0].city,
                        country: location[0].country,
                        street: location[0].street,
                        latitude: r.coords.latitude,
                        longitude: r.coords.longitude,
                    }
                }))
                .catch(error => console.log("Couldn't reverse geocode", error))
        }).catch(error => console.log("Couldn't get current position", error))
    }

    getLocation = () => {
        Location.getPermissionsAsync().then(permission => {
            if (permission.granted) {
                this.getLocationAfterPermissionGranted();
            } else {
                Location.requestPermissionsAsync().then(permission => {
                    if (permission.granted) {
                        this.getLocationAfterPermissionGranted();
                    }
                })
            }
        })
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
                <Button title={"Get Location"} onPress={this.getLocation}/>
                {this.state.locationRetrieved ? (
                    <View style={{paddingTop: 10}}>
                        <Text style={{
                            fontSize: 15,
                            textAlign: "center"
                        }}>{"Country " + this.state.location.country}</Text>
                        <Text style={{fontSize: 15, textAlign: "center"}}>{"City " + this.state.location.city}</Text>
                        <Text
                            style={{fontSize: 15, textAlign: "center"}}>{"Street " + this.state.location.street}</Text>
                        <Text
                            style={{
                                fontSize: 15,
                                textAlign: "center"
                            }}>{"latitude: " + this.state.location.latitude + " longitude: " + this.state.location.longitude}</Text>

                    </View>
                ) : <></>}
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