import React, {Component} from 'react';
import ChatView from "../chat/ChatInput";

class U2UChatScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userId:  this.props.route.params.userId,
        }
    }

    render() {
        console.log(this.state.userId)
        return (
            <ChatView
            />
        );
    }
}

export default U2UChatScreen;
