import React, {Component} from 'react';
import {StyleSheet, View} from "react-native";
import Swiper from "../profile/Swiper";
import UserProfile from "../profile/UserProfile";
import {connect} from "react-redux";


class DiscoverScreen extends Component {
    constructor(props) {
        super(props);
    }

    handleLiked = (item) => {
        console.log("Liked", item);
    }

    handlePassed = (item) => {
        console.log("Passed", item);
    }

    render() {
        return (
            <View style={styles.container}>
                <Swiper
                    data={[
                        new UserProfile(5, "John Doe", "Student", "I'd like to name my kid a whole phrase, you know, something like 'Ladies and Gentlemen'. That'll be a cool name for a kid. \"This is my son, Ladies and Gentlemen\"... Then when he gets out of hand I get to go \"Ladies and Gentlemen, please!\""),
                        new UserProfile(6),
                        new UserProfile(7),
                    ]}
                    onSwipeRight={this.handleLiked}
                    onSwipeLeft={this.handlePassed}
                />
            </View>
        );
    }
}

const mapStateToProps = state => ({
    profiles: state.profile.profiles,
});

export default connect(mapStateToProps)(DiscoverScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
