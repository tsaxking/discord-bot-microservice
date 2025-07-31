import {
	ApplicationCommandOptionChoiceData,
	AutocompleteInteraction,
	CommandInteraction,
	DiscordAPIError,
	RESTJSONErrorCodes as DiscordApiErrors,
	EmbedBuilder,
	InteractionReplyOptions,
	InteractionResponse,
	InteractionUpdateOptions,
	Message,
	MessageComponentInteraction,
	ModalSubmitInteraction,
	WebhookMessageEditOptions
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
	DiscordApiErrors.MaximumActiveThreads
];

export class InteractionUtils {
	public static deferReply(
		intr: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction,
		hidden: boolean = false
	) {
		return attemptAsync(async () => {
			return intr.deferReply({
				ephemeral: hidden
			});
		});
	}

	public static deferUpdate(intr: MessageComponentInteraction | ModalSubmitInteraction) {
		return attemptAsync(async () => {
			return intr.deferUpdate();
		});
	}

	public static send(
		intr: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction,
		content: string | EmbedBuilder | InteractionReplyOptions,
		hidden: boolean = false
	) {
		return attemptAsync(async () => {
			let options: InteractionReplyOptions =
				typeof content === 'string'
					? { content }
					: content instanceof EmbedBuilder
						? { embeds: [content] }
						: content;
			if (intr.deferred || intr.replied) {
				return await intr.followUp({
					...options,
					ephemeral: hidden
				});
			} else {
				return await intr.reply({
					...options,
					ephemeral: hidden,
					fetchReply: true
				});
			}
		});
	}

	public static respond(
		intr: AutocompleteInteraction,
		choices: ApplicationCommandOptionChoiceData[] = []
	) {
		return attemptAsync(async () => {
			return intr.respond(choices);
		});
	}

	public static editReply(
		intr: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction,
		content: string | EmbedBuilder | WebhookMessageEditOptions
	) {
		return attemptAsync(async () => {
			let options: WebhookMessageEditOptions =
				typeof content === 'string'
					? { content }
					: content instanceof EmbedBuilder
						? { embeds: [content] }
						: content;
			return await intr.editReply(options);
		});
	}

	public static update(
		intr: MessageComponentInteraction,
		content: string | EmbedBuilder | InteractionUpdateOptions
	) {
		return attemptAsync(async () => {
			let options: InteractionUpdateOptions =
				typeof content === 'string'
					? { content }
					: content instanceof EmbedBuilder
						? { embeds: [content] }
						: content;
			return await intr.update({
				...options,
				fetchReply: true
			});
		});
	}
}
