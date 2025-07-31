import {
    CommandInteraction,
    GuildChannel,
    MessageComponentInteraction,
    ModalSubmitInteraction,
    ThreadChannel,
} from 'discord.js';

import { FormatUtils, InteractionUtils } from './index.js';
import { Command } from '../commands/index.js';
import { Permission } from '../models/enum-helpers/index.js';
import { EventData } from '../models/internal-models.js';
import { Lang } from '../services/index.js';
import { attemptAsync } from 'ts-utils/check';

export class CommandUtils {
    public static findCommand(commands: Command[], commandParts: string[]): Command | undefined {
        let found = [...commands];
        let closestMatch: Command | undefined = undefined;
        for (let [index, commandPart] of commandParts.entries()) {
            found = found.filter(command => command.names[index] === commandPart);
            if (found.length === 0) {
                return closestMatch;
            }

            if (found.length === 1) {
                return found[0];
            }

            let exactMatch = found.find(command => command.names.length === index + 1);
            if (exactMatch) {
                closestMatch = exactMatch;
            }
        }
        return closestMatch;
    }

    public static runChecks(
        command: Command,
        intr: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction,
        data: EventData
    ) {
        return attemptAsync(async () => {
            if (command.cooldown) {
            let limited = command.cooldown.take(intr.user.id);
            if (limited) {
                await InteractionUtils.send(
                    intr,
                    Lang.getEmbed('validationEmbeds.cooldownHit', data.lang, {
                        AMOUNT: command.cooldown.amount.toLocaleString(data.lang),
                        INTERVAL: FormatUtils.duration(command.cooldown.interval, data.lang),
                    }).unwrap()
                );
                return false;
            }
        }

        if (
            (intr.channel instanceof GuildChannel || intr.channel instanceof ThreadChannel) &&
            !intr.channel.permissionsFor(intr.client.user)?.has(command.requireClientPerms)
        ) {
            await InteractionUtils.send(
                intr,
                Lang.getEmbed('validationEmbeds.missingClientPerms', data.lang, {
                    PERMISSIONS: command.requireClientPerms
                        .map(perm => `**${Permission.Data[perm].displayName(data.lang)}**`)
                        .join(', '),
                }).unwrap()
            );
            return false;
        }

        return true;
        });
    }
}
