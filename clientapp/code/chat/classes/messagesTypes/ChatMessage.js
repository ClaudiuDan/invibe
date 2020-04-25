import {saveToLocalStorage} from "../../../Utils/Utils";

//INFO: When creating a new type of message, you have to add a new case in the ChatUtils functions and an enum field in ChatMessageTypes.
export default class ChatMessage {
    constructor(direction,
                receiver,
                saveContent = true,
                sent = false,
                datetime = new Date(),
                createdTimestamp = Date.now(),
                id = Math.floor(Math.random() * 1e9)
    ) {
        if (new.target === ChatMessage) {
            throw new TypeError("Cannot construct Abstract instances of ChatMessage directly");
        }
        this._direction = direction;
        this._datetime = new Date(datetime);
        this._createdTimestamp = createdTimestamp;
        this._sent = sent;
        this._id = id;
        this._receiver = receiver.toString();
        this._saveContent = saveContent;
    }
    isEqual(chatMessage) {
        if (!chatMessage) {
            return false;
        }


        return (this.direction === "right" && this.createdTimestamp === chatMessage.createdTimestamp) || // Own message, not always has a db generated id
            (this.direction === "left" && this.id === chatMessage.id);
    }

    getUniqueKey() {
        return this.direction === "right" ?
            "r-" + this.createdTimestamp.toString() :
            "l-" + this.id.toString();
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
            direction: this.direction,
            receiver: this.receiver,
            datetime: this.datetime,
            createdTimestamp: this.createdTimestamp,
            sent: this.sent,
            id: this.id,
        }
    }

    sendMessageViaWebSocket(_ws) {
        throw new TypeError("Cannot call sendMessageViaWebSocket of ChatMessage; Must be implemented in child class.");
    }

    getComponentToRender(_key) {
        throw new TypeError("Cannot call getComponentToRender of ChatMessage; Must be implemented in child class.");
    }

    // Getters

    get receiver() {
        return this._receiver;
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

    get saveContent() {
        return this._saveContent;
    }
}