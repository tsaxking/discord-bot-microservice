import { DiscordAPIError, RESTJSONErrorCodes as DiscordApiErrors, ThreadChannel } from 'discord.js';
import { attemptAsync } from 'ts-utils/check';

const IGNORED_ERRORS = [
	DiscordApiErrors.UnknownMessage,
	DiscordApiErrors.UnknownChannel,
	DiscordApiErrors.UnknownGuild,
	DiscordApiErrors.UnknownUser,
	DiscordApiErrors.UnknownInteraction,
	DiscordApiErrors.CannotSendMessagesToThisUser, // User blocked bot or DM disabled
	DiscordApiErrors.ReactionWasBlocked, // User blocked bot or DM disabled
	DiscordApiErrors.MaximumActiveThreads
];

export class ThreadUtils {
	public static archive(thread: ThreadChannel, archived: boolean = true) {
		return attemptAsync(() => thread.setArchived(true));
	}

	public static lock(thread: ThreadChannel, locked: boolean = true) {
		return attemptAsync(() => thread.setLocked(locked));
	}
}
