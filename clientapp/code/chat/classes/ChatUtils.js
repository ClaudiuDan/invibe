import {parseISOString, retrieveFromLocalStorage} from "../../Utils/Utils";
import {messageType} from "./messagesTypes/ChatMessageTypes";
import TextChatMessage from "./messagesTypes/TextChatMessage";

export async function retrieveMessage(key) {
    const value = await retrieveFromLocalStorage(
        key,
        "Could not retrieve message with unique key " + key + " from local storage."
    );

    if (!value) {
        return null;
    }

    switch (value.type) {
        case messageType.TEXT:
            return TextChatMessage.instanceFromDictionary(value);
        default:
            return null;
    }
}

export function messageFromServerData(direction, data) {
    // Always text message for now
    // if (data.message_type.toString() === "textMessage") {
    const receiver = direction === "left" ? data.sender : data.receiver;
    return new TextChatMessage(
        data.text,
        direction,
        receiver,
        true,
        parseISOString(data.datetime),
        data.created_timestamp,
        data.id
    );
}
