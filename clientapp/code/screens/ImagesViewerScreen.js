import React, {Component} from "react";
import ImageView from "react-native-image-viewing";

//TODO: Solve Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application
class ImagesViewerScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            visible: true
        }
    }

    render() {
        const {images, imageIndex} = this.props.route.params;
        return <ImageView
            images={images}
            imageIndex={imageIndex}
            visible={this.state.visible}
            onRequestClose={() => {
                this.setState({visible: false}, () => setTimeout(this.props.navigation.pop, 50));
            }}
            presentationStyle={"overFullScreen"}
        />;
    }
}

export default ImagesViewerScreen;