import {
    ApplicationCommand,
    Channel,
    Client,
    DiscordAPIError,
    RESTJSONErrorCodes as DiscordApiErrors,
    Guild,
    GuildMember,
    Locale,
    NewsChannel,
    Role,
    StageChannel,
    TextChannel,
    User,
    VoiceChannel,
} from 'discord.js';

import { PermissionUtils, RegexUtils } from './index.js';
import { Lang } from '../services/index.js';
import { attemptAsync } from 'ts-utils/check';

const FETCH_MEMBER_LIMIT = 20;
const IGNORED_ERRORS = [
    DiscordApiErrors.UnknownMessage,
    DiscordApiErrors.UnknownChannel,
    DiscordApiErrors.UnknownGuild,
    DiscordApiErrors.UnknownMember,
    DiscordApiErrors.UnknownUser,
    DiscordApiErrors.UnknownInteraction,
    DiscordApiErrors.MissingAccess,
];

export class ClientUtils {
    public static getGuild(client: Client, discordId: string) {
        return attemptAsync(async () => {
            discordId = RegexUtils.discordId(discordId) || '';
            if (!discordId) {
                throw new Error('Invalid Discord ID format');
            }

            return client.guilds.fetch(discordId);
        });
    }

    public static getChannel(client: Client, discordId: string) {
        return attemptAsync(async () => {
            discordId = RegexUtils.discordId(discordId) || '';
            if (!discordId) {
                throw new Error('Invalid Discord ID format');
            }
            const c = await client.channels.fetch(discordId);
            if (c) {
                return c;
            } else {
                throw new Error('Channel not found or is not a valid type');
            }
        });
    }

    public static getUser(client: Client, discordId: string) {
        return attemptAsync(async () => {
            discordId = RegexUtils.discordId(discordId) || '';
            if (!discordId) {
                throw new Error('Invalid Discord ID format');
            }

            return client.users.fetch(discordId);
        });
    }

    public static findAppCommand(client: Client, name: string) {
        return attemptAsync(async () => {
            const commands = await client.application?.commands.fetch();
            if (!commands) {
                throw new Error('No application commands found');
            }
            return commands.find(command => command.name === name);
        });
    }

    public static findMember(guild: Guild, input: string) {
            return attemptAsync(async () => {
                let discordId = RegexUtils.discordId(input);
                if (discordId) {
                    return await guild.members.fetch(discordId);
                }

                let tag = RegexUtils.tag(input);
                if (tag) {
                    return (
                        await guild.members.fetch({ query: tag.username, limit: FETCH_MEMBER_LIMIT })
                    ).find(member => member.user.discriminator === tag.discriminator);
                }

                return (await guild.members.fetch({ query: input, limit: 1 })).first();
            });
    }

    public static findRole(guild: Guild, input: string) {
        return attemptAsync(async () => {
            let discordId = RegexUtils.discordId(input);
            if (discordId) {
                return await guild.roles.fetch(discordId);
            }

            let search = input.trim().toLowerCase().replace(/^@/, '');
            let roles = await guild.roles.fetch();
            return (
                roles.find(role => role.name.toLowerCase() === search) ??
                roles.find(role => role.name.toLowerCase().includes(search))
            );
        });
    }

    public static findTextChannel(
        guild: Guild,
        input: string
    ) {
        return attemptAsync(async () => {
            let discordId = RegexUtils.discordId(input);
            if (discordId) {
                let channel = await guild.channels.fetch(discordId);
                if (channel instanceof NewsChannel || channel instanceof TextChannel) {
                    return channel;
                } else {
                    return;
                }
            }

            let search = input.trim().toLowerCase().replace(/^#/, '').replaceAll(' ', '-');
            let channels = [...(await guild.channels.fetch()).values()].filter(
                channel => channel instanceof NewsChannel || channel instanceof TextChannel
            );
            return (
                channels.find(channel => channel.name.toLowerCase() === search) ??
                channels.find(channel => channel.name.toLowerCase().includes(search))
            );
        });
    }

    public static findVoiceChannel(
        guild: Guild,
        input: string
    ) {
        return attemptAsync(async () => {
            let discordId = RegexUtils.discordId(input);
            if (discordId) {
                let channel = await guild.channels.fetch(discordId);
                if (channel instanceof VoiceChannel || channel instanceof StageChannel) {
                    return channel;
                } else {
                    return;
                }
            }

            let search = input.trim().toLowerCase().replace(/^#/, '');
            let channels = [...(await guild.channels.fetch()).values()].filter(
                channel => channel instanceof VoiceChannel || channel instanceof StageChannel
            );
            return (
                channels.find(channel => channel.name.toLowerCase() === search) ??
                channels.find(channel => channel.name.toLowerCase().includes(search))
            );
        });
    }

    public static findNotifyChannel(
        guild: Guild,
        langCode: Locale
    ) {
        return attemptAsync(async () => {
            // Prefer the system channel
            let systemChannel = guild.systemChannel;
            if (systemChannel && PermissionUtils.canSend(systemChannel, true)) {
                return systemChannel;
            }

            // Otherwise look for a bot channel
            return (await guild.channels.fetch()).find(
                channel =>
                    (channel instanceof TextChannel || channel instanceof NewsChannel) &&
                    PermissionUtils.canSend(channel, true) &&
                    Lang.getRegex('channelRegexes.bot', langCode).test(channel.name)
            ) as TextChannel | NewsChannel;
        });
    }
}
