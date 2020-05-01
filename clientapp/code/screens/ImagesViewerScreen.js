import React, {Component} from "react";
import ImageView from "react-native-image-viewing";


class ImagesViewerScreen extends Component {

    constructor(props) {
        super(props);

        this.state={
            visible: true
        }
    }

    render() {
        const {images, imageIndex} = this.props.route.params;
        return (
            <ImageView
                images={images}
                imageIndex={imageIndex}
                visible={this.state.visible}
                onRequestClose={() => {
                    this.setState({visible: false});
                    this.props.navigation.pop();
                }}
            />
        );
    }
}

export default ImagesViewerScreen;