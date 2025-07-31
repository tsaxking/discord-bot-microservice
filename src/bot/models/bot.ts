import {
	AutocompleteInteraction,
	ButtonInteraction,
	Client,
	CommandInteraction,
	Events,
	Guild,
	Interaction,
	Message,
	MessageReaction,
	PartialMessageReaction,
	PartialUser,
	RateLimitData,
	RESTEvents,
	User
} from 'discord.js';
import { createRequire } from 'node:module';

import {
	ButtonHandler,
	CommandHandler,
	GuildJoinHandler,
	GuildLeaveHandler,
	MessageHandler,
	ReactionHandler
} from '../events/index.js';
import { JobService, Logger } from '../services/index.js';
import { PartialUtils } from '../utils/index.js';
import { attempt, attemptAsync } from 'ts-utils/check';

const require = createRequire(import.meta.url);
let Config = require('../../config/config.json');
let Debug = require('../../config/debug.json');
let Logs = require('../../lang/logs.json');

export class Bot {
	private ready = false;

	constructor(
		private token: string,
		private client: Client,
		private guildJoinHandler: GuildJoinHandler,
		private guildLeaveHandler: GuildLeaveHandler,
		private messageHandler: MessageHandler,
		private commandHandler: CommandHandler,
		private buttonHandler: ButtonHandler,
		private reactionHandler: ReactionHandler,
		private jobService: JobService
	) {}

	public async start(): Promise<void> {
		this.registerListeners();
		await this.login(this.token);
	}

	private registerListeners(): void {
		this.client.on(Events.ClientReady, () => this.onReady());
		// this.client.on(Events.ShardReady, (shardId: number, unavailableGuilds: Set<string>) =>
		//     this.onShardReady(shardId, unavailableGuilds)
		// );
		this.client.on(Events.GuildCreate, (guild: Guild) => this.onGuildJoin(guild));
		this.client.on(Events.GuildDelete, (guild: Guild) => this.onGuildLeave(guild));
		this.client.on(Events.MessageCreate, (msg: Message) => this.onMessage(msg));
		this.client.on(Events.InteractionCreate, (intr: Interaction) => this.onInteraction(intr));
		this.client.on(
			Events.MessageReactionAdd,
			(messageReaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) =>
				this.onReaction(messageReaction, user)
		);
		this.client.rest.on(RESTEvents.RateLimited, (rateLimitData: RateLimitData) =>
			this.onRateLimit(rateLimitData)
		);
	}

	private login(token: string) {
		return attemptAsync(async () => {
			await this.client.login(token);
		});
	}

	private onReady() {
		return attemptAsync(async () => {
			let userTag = this.client.user?.tag;
			Logger.info(Logs.info.clientLogin.replaceAll('{USER_TAG}', userTag));

			if (!Debug.dummyMode.enabled) {
				this.jobService.start();
			}

			this.ready = true;
			Logger.info(Logs.info.clientReady);
		});
	}

	private onShardReady(shardId: number, _unavailableGuilds: Set<string>): void {
		Logger.setShardId(shardId);
	}

	private onGuildJoin(guild: Guild) {
		return attemptAsync(async () => {
			if (!this.ready || Debug.dummyMode.enabled) {
				return;
			}

			await this.guildJoinHandler.process(guild);
		});
	}

	private onGuildLeave(guild: Guild) {
		return attemptAsync(async () => {
			if (!this.ready || Debug.dummyMode.enabled) {
				return;
			}

			await this.guildLeaveHandler.process(guild);
		});
	}

	private onMessage(msg: Message) {
		return attemptAsync(async () => {
			if (
				!this.ready ||
				(Debug.dummyMode.enabled && !Debug.dummyMode.whitelist.includes(msg.author.id))
			) {
				return;
			}

			msg = await PartialUtils.fillMessage(msg).unwrap();
			if (!msg) {
				return;
			}

			await this.messageHandler.process(msg);
		});
	}

	private onInteraction(intr: Interaction) {
		return attemptAsync(async () => {
			if (
				!this.ready ||
				(Debug.dummyMode.enabled && !Debug.dummyMode.whitelist.includes(intr.user.id))
			) {
				return;
			}

			if (intr instanceof CommandInteraction || intr instanceof AutocompleteInteraction) {
				await this.commandHandler.process(intr);
			} else if (intr instanceof ButtonInteraction) {
				await this.buttonHandler.process(intr);
			}
		});
	}

	private async onReaction(
		msgReaction: MessageReaction | PartialMessageReaction,
		reactor: User | PartialUser
	) {
		return attemptAsync(async () => {
			if (
				!this.ready ||
				(Debug.dummyMode.enabled && !Debug.dummyMode.whitelist.includes(reactor.id))
			) {
				return;
			}

			msgReaction = await PartialUtils.fillReaction(msgReaction).unwrap();
			if (!msgReaction) {
				return;
			}

			reactor = await PartialUtils.fillUser(reactor).unwrap();
			if (!reactor) {
				return;
			}

			await this.reactionHandler.process(msgReaction, msgReaction.message as Message, reactor);
		});
	}

	private async onRateLimit(rateLimitData: RateLimitData): Promise<void> {
		if (rateLimitData.timeToReset >= Config.logging.rateLimit.minTimeout * 1000) {
			Logger.error(Logs.error.apiRateLimit, rateLimitData);
		}
	}
}
