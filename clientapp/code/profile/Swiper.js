import React, {Component} from 'react';
import {Animated, Dimensions, Image, PanResponder, ScrollView, Text, View} from 'react-native';
import {Card} from 'react-native-elements';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

class Swiper extends Component {

    constructor(props) {
        super(props);

        this.position = new Animated.ValueXY();

        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onPanResponderMove: (evt, gestureState) => {
                this.position.setValue({x: gestureState.dx * 0.95, y: gestureState.dy * 0.95});
            },
            onPanResponderRelease: (evt, gesture) => {
                if (gesture.dx > SWIPE_THRESHOLD) {
                    this.forceSwipe('right');
                } else if (gesture.dx < -SWIPE_THRESHOLD) {
                    this.forceSwipe('left');
                } else {
                    this.resetPosition();
                }
            }
        });

        this.state = {index: 0};
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.data !== this.props.data) {
            this.setState({
                index: this.state.index - this.props.savedIndex,
            })
        }
    }

    resetPosition = () => {
        Animated.spring(this.position, {
            toValue: {x: 0, y: 0}
        }).start();
    }

    forceSwipe = (direction) => {
        const x = direction === 'right' ? SCREEN_WIDTH * 2 : -SCREEN_WIDTH * 2;
        Animated.timing(this.position, {
            toValue: {x: x, y: 0},
            duration: SWIPE_OUT_DURATION
        }).start(() => this.onSwipeComplete(direction));
    }

    onSwipeComplete = (direction) => {
        const {onSwipeLeft, onSwipeRight, data} = this.props;
        const item = data[this.state.index];

        direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item);
        this.position.setValue({x: 0, y: 0});
        if (this.state.index >= this.props.data.length - 3) {
            this.props.approachingEndOfList(this.state.index + 1);
        }
        this.setState({index: this.state.index + 1});
    }

    renderCard = (userProfile, index) => {
        return (
            <View style={{alignSelf: 'stretch'}}>
                <Card title={userProfile.name !== "" ? userProfile.name : "Invive User " + userProfile.userId}
                      titleStyle={{fontSize: 20}} key={index}>
                    <View style={{height: "47%"}}>
                        <Image key={1}
                               source={userProfile.profileImage}
                               style={{width: '100%', height: "100%", borderRadius: 200}}
                        />
                    </View>
                    <View style={styles.detailWrapper}>
                        <Text
                            style={{fontStyle: "italic"}}
                            key={1}>{userProfile.shortDescription !== "" ? userProfile.shortDescription : "Short description"}</Text>
                    </View>
                    <View style={styles.longDescription}>
                        <Text key={1}>
                            {userProfile.longDescription !== "" ? userProfile.longDescription : "Long description"}
                        </Text>
                    </View>
                </Card>
            </View>
        );
    }

    renderNoMoreCards = () => {
        return (
            <Card title="No More Profiles">
            </Card>
        );
    };

    getCardStyle = () => {
        const {position} = this;
        const rotate = position.x.interpolate({
            inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
            outputRange: ['-80deg', '0deg', '80deg']
        });

        return {
            ...position.getLayout(),
            transform: [{rotate}]
        };
    }

    renderCards = () => {
        if (this.state.index >= this.props.data.length) {
            return this.renderNoMoreCards();
        }

        return this.props.data.map((item, i) => {
            if (i < this.state.index) {
                return null;
            }

            if (i === this.state.index) {
                return (
                    <Animated.View
                        key={i}
                        style={[this.getCardStyle(), styles.container, {top: "10%", zIndex: 99}]}
                        {...this._panResponder.panHandlers}
                    >
                        {this.renderCard(item, i)}
                    </Animated.View>
                );
            }

            return (
                <View
                    key={i}
                    style={[styles.container, {top: "10%", left: 0, right: 0, bottom: 0, zIndex: 5}]}
                >
                    {this.renderCard(item, i)}
                </View>
            );
        }).reverse();
    };

    render() {
        return <>{this.renderCards()}</>;
    }

}

const styles = {
    container: {
        width: SCREEN_WIDTH / 1.1,
        height: SCREEN_HEIGHT / 1.2,
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: 10,
        position: "absolute",
    },

    detailWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: "stretch",
        marginBottom: 20,
        marginTop: 20,
    },

    longDescription: {
        height: "20%",
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'stretch',
    },
};

export default Swiper;