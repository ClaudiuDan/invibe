import {saveToLocalStorage} from "../../Utils/Utils";

export default class ChatMessage {
    constructor(direction,
                receiver,
                sent = false,
                datetime = new Date(),
                createdTimestamp = Math.floor(Date.now() / 100),
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
        this._receiver = receiver.toString();
        this.save();
    }

    isEqual(chatMessage) {
        if (!chatMessage) {
            return false;
        }


        return (this._direction === "right" && this._createdTimestamp === chatMessage.createdTimestamp) || // Own message, not always has a db generated id
            (this._direction === "left" && this._id === chatMessage.id);
    }

    getUniqueKey() {
        return this.direction === "right" ?
            "r-" + this._createdTimestamp.toString() :
            "l-" + this._id.toString();
    }

    save() {
        saveToLocalStorage(
            this.getUniqueKey(),
            this.getDictionary(),
            "Could not save message with unique key " + this.getUniqueKey() + " to local storage."
        );
    }

    getDictionary() {
        return {
            direction: this._direction,
            receiver: this._receiver,
            datetime: this._datetime,
            createdTimestamp: this._createdTimestamp,
            sent: this._sent,
            id: this._id,
        }
    }

    getComponentToRender(_key) {
        throw new TypeError("Cannot call getComponentToRender of ChatMessage; Must be implemented in child class.");
    }

    // Getters and Setters
    set datetime(value) {
        this._datetime = value;
    }

    get receiver() {
        return this._receiver;
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