import React, {Component} from 'react';
import ChatView from "../chat/components/ChatView";

class U2UChatScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            receiverId:  this.props.route.params.receiverId,
        }
    }

    render() {
        return (
            <ChatView
                receiverId={this.props.route.params.receiverId}
            />
        );
    }
}

export default U2UChatScreen;
