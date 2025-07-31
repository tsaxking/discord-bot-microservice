import { ChatInputCommandInteraction, EmbedBuilder, PermissionsString } from 'discord.js';

import { HelpOption } from '../../enums/index.js';
import { Language } from '../../models/enum-helpers/index.js';
import { EventData } from '../../models/internal-models.js';
import { Lang, Logger } from '../../services/index.js';
import { ClientUtils, FormatUtils, InteractionUtils } from '../../utils/index.js';
import { Command, CommandDeferType } from '../index.js';

export class HelpCommand implements Command {
    public names = [Lang.getRef('chatCommands.help', Language.Default)];
    public deferType = CommandDeferType.HIDDEN;
    public requireClientPerms: PermissionsString[] = [];
    public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
        let args = {
            option: intr.options.getString(
                Lang.getRef('arguments.option', Language.Default)
            ) as HelpOption,
        };

        let embed: EmbedBuilder;
        try {
            switch (args.option) {
                case HelpOption.CONTACT_SUPPORT: {
                    embed = Lang.getEmbed('displayEmbeds.helpContactSupport', data.lang).unwrap();
                    break;
                }
                case HelpOption.COMMANDS: {
                    const test = await ClientUtils.findAppCommand(
                        intr.client,
                        Lang.getRef('chatCommands.test', Language.Default)
                    ).unwrap();
                    if (!test) {
                        Logger.error(
                            `Test command not found.\nInteraction ID: ${intr.id}\nUser ID: ${intr.user.id}`
                        );
                        return;
                    }
                    const info = await ClientUtils.findAppCommand(
                        intr.client,
                        Lang.getRef('chatCommands.info', Language.Default)
                    ).unwrap();
                    if (!info) {
                        Logger.error(
                            `Info command not found.\nInteraction ID: ${intr.id}\nUser ID: ${intr.user.id}`
                        );
                        return;
                    }
                    embed = Lang.getEmbed('displayEmbeds.helpCommands', data.lang, {
                        CMD_LINK_TEST: FormatUtils.commandMention(
                            test
                        ),
                        CMD_LINK_INFO: FormatUtils.commandMention(
                            info
                        ),
                    }).unwrap();
                    break;
                }
                default: {
                    return;
                }
            }
        } catch (error) {
            if (error instanceof Error) {
                Logger.error(
                    error.message + `\nInteraction ID: ${intr.id}\nUser ID: ${intr.user.id}`
                );
                return;
            }
            return;
        }

        await InteractionUtils.send(intr, embed);
    }
}
