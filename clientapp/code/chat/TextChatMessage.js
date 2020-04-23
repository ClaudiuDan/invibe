import ChatMessage from "./ChatMessage";

export default class TextChatMessage extends ChatMessage {
    constructor(text, ...args) {
        super(...args);
        this._text = text;
    }

    getDictionary() {
        return {
            ...super.getDictionary(),
            text: this._text,
        };
    }

    get text() {
        return this._text;
    }

}