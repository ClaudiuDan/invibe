import React, {Component} from 'react';
import ChatView from "../chat/components/ChatView";

class U2UChatScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userId:  this.props.route.params.userId,
        }
    }

    render() {
        return (
            <ChatView
                userId={this.props.route.params.userId}
            />
        );
    }
}

export default U2UChatScreen;
