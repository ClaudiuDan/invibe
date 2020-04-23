export default class ChatMessage {
    constructor(direction,
                receiver,
                sent = false,
                datetime = new Date(),
                createdTimestamp = Math.floor(Date.now() / 1000),
                id = Math.floor(Math.random() * 1e9)
    ) {

        if (new.target === ChatMessage) {
            throw new TypeError("Cannot construct Abstract instances of ChatMessage directly");
        }
        this._direction = direction;
        this._datetime = datetime;
        this._createdTimestamp = createdTimestamp;
        this._sent = sent;
        this._id = id;
        this._receiver = receiver;
    }

    isEqual(chatMessage) {
        if (!chatMessage) {
            return false;
        }


        return (this._direction === "right" && this._createdTimestamp === chatMessage.createdTimestamp) || // Own message, not always has a db generated id
            (this._direction === "left" && this._id === chatMessage.id);
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