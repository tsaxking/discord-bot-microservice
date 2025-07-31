import {
    DiscordAPIError,
    RESTJSONErrorCodes as DiscordApiErrors,
    Message,
    MessageReaction,
    PartialMessage,
    PartialMessageReaction,
    PartialUser,
    User,
} from 'discord.js';
import { attemptAsync } from 'ts-utils/check';

const IGNORED_ERRORS = [
    DiscordApiErrors.UnknownMessage,
    DiscordApiErrors.UnknownChannel,
    DiscordApiErrors.UnknownGuild,
    DiscordApiErrors.UnknownUser,
    DiscordApiErrors.UnknownInteraction,
    DiscordApiErrors.MissingAccess,
];

export class PartialUtils {
    public static fillUser(user: User | PartialUser) {
        return attemptAsync(async () => {
            if (user.partial) return user.fetch();
            return user as User;
        });
    }

    public static fillMessage(msg: Message | PartialMessage) {
        return attemptAsync(async () => {
            if (msg.partial) return msg.fetch();
            return msg as Message;
        });
    }

    public static fillReaction(
        msgReaction: MessageReaction | PartialMessageReaction
    ) {
        return attemptAsync(async () => {
            if (msgReaction.partial) {
                msgReaction = await msgReaction.fetch();
            }

            msgReaction.message = await this.fillMessage(msgReaction.message).unwrap();
            if (!msgReaction.message) {
                throw new Error('Message not found for reaction');
            }

            return msgReaction as MessageReaction;
        });
    }
}
