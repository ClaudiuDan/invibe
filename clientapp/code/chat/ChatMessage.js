class ChatMessage {
    constructor(direction,
                sender,
                receiver,
                datetime = new Date(),
                createdTimestamp = Math.floor(Date.now() / 1000),
                sent = false, id = Math.floor(Math.random() * 1e9)
    ) {

        if (new.target === ChatMessage) {
            throw new TypeError("Cannot construct Abstract instances of ChatMessage directly");
        }
        this._direction = direction;
        this._datetime = datetime;
        this._createdTimestamp = createdTimestamp;
        this._sent = sent;
        this._id = id;
        this._sender = sender;
        this._receiver = receiver;
    }

    isEqual(chatMessage) {
        if (!chatMessage) {
            return false;
        }

        return this._sender === chatMessage.sender && this._createdTimestamp === chatMessage.createdTimestamp;
    }

    getDictionary() {
        return {
            direction: this._direction,
            datetime: this._datetime,
            created_timestamp: this._createdTimestamp,
            sent: this._sent,
            id: this._id,
        }
    }

    get sender() {
        return this._sender;
    }

    get receiver() {
        return this._receiver;
    }

    // Getters and Setters
    set datetime(value) {
        this._datetime = value;
    }

    set sent(value) {
        this._sent = value;
    }

    set id(value) {
        this._id = value;
    }

    get direction() {
        return this._direction;
    }

    get datetime() {
        return this._datetime;
    }

    get createdTimestamp() {
        return this._createdTimestamp;
    }

    get sent() {
        return this._sent;
    }

    get id() {
        return this._id;
    }
}