import {parseISOString, retrieveFromLocalStorage} from "../../Utils/Utils";
import {messageType} from "./messagesTypes/ChatMessageTypes";
import TextChatMessage from "./messagesTypes/TextChatMessage";
import ImageChatMessage from "./messagesTypes/ImageChatMessage";

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
        case messageType.IMAGE:
            return ImageChatMessage.instanceFromDictionary(value);
        default:
            console.log("Should not reach this point. Check retrieveMessage in ChatUtils.");
            return null;
    }
}

export function messageFromServerData(direction, data) {
    // Always text message for now
    // if (data.message_type.toString() === "textMessage") {
    const receiver = direction === "left" ? data.sender : data.receiver;
    console.log(data.created_timestamp)
    return new TextChatMessage(
        data.text,
        direction,
        receiver,
        true,
        true,
        parseISOString(data.datetime),
        data.created_timestamp,
        data.id
    );
}
