import {retrieveFromLocalStorage} from "../../Utils/Utils";
import {messageType} from "./ChatMessageTypes";
import TextChatMessage from "./TextChatMessage";

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
