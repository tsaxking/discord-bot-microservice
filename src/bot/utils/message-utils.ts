import {
    BaseMessageOptions,
    DiscordAPIError,
    RESTJSONErrorCodes as DiscordApiErrors,
    EmbedBuilder,
    EmojiResolvable,
    Message,
    MessageEditOptions,
    MessageReaction,
    PartialGroupDMChannel,
    StartThreadOptions,
    TextBasedChannel,
    ThreadChannel,
    User,
} from 'discord.js';
import { attemptAsync } from 'ts-utils/check';

const IGNORED_ERRORS = [
    DiscordApiErrors.UnknownMessage,
    DiscordApiErrors.UnknownChannel,
    DiscordApiErrors.UnknownGuild,
    DiscordApiErrors.UnknownUser,
    DiscordApiErrors.UnknownInteraction,
    DiscordApiErrors.CannotSendMessagesToThisUser, // User blocked bot or DM disabled
    DiscordApiErrors.ReactionWasBlocked, // User blocked bot or DM disabled
    DiscordApiErrors.MaximumActiveThreads,
];

export class MessageUtils {
    public static send(
        target: User | TextBasedChannel,
        content: string | EmbedBuilder | BaseMessageOptions
    ) {
        return attemptAsync(async () => {
            if (target instanceof PartialGroupDMChannel) return;
            let options: BaseMessageOptions =
                typeof content === 'string'
                    ? { content }
                    : content instanceof EmbedBuilder
                        ? { embeds: [content] }
                        : content;
            return target.send(options);
        });
    }

    public static reply(
        msg: Message,
        content: string | EmbedBuilder | BaseMessageOptions
    ) {
        return attemptAsync(async () => {
            let options: BaseMessageOptions =
                typeof content === 'string'
                    ? { content }
                    : content instanceof EmbedBuilder
                      ? { embeds: [content] }
                      : content;
            return msg.reply(options);
        });
    }

    public static edit(
        msg: Message,
        content: string | EmbedBuilder | MessageEditOptions
    ) {
        return attemptAsync(async () => {
            let options: MessageEditOptions =
                typeof content === 'string'
                    ? { content }
                    : content instanceof EmbedBuilder
                      ? { embeds: [content] }
                      : content;
            return msg.edit(options);
        });
    }

    public static react(msg: Message, emoji: EmojiResolvable) {
        return attemptAsync(async () => {
            return msg.react(emoji);
        });
    }

    public static pin(msg: Message, pinned: boolean = true) {
        return attemptAsync(async () => {
            return pinned ? msg.pin() : msg.unpin();
        });
    }

    public static startThread(
        msg: Message,
        options: StartThreadOptions
    ) {
        return attemptAsync(async () => {
            return msg.startThread(options);
        });
    }

    public static delete(msg: Message) {
        return attemptAsync(async () => {
            return msg.delete();
        });
    }
}
