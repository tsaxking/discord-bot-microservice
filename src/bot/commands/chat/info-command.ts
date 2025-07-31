import { ChatInputCommandInteraction, EmbedBuilder, PermissionsString } from 'discord.js';

import { InfoOption } from '../../enums/index.js';
import { Language } from '../../models/enum-helpers/index.js';
import { EventData } from '../../models/internal-models.js';
import { Lang, Logger } from '../../services/index.js';
import { InteractionUtils } from '../../utils/index.js';
import { Command, CommandDeferType } from '../index.js';

export class InfoCommand implements Command {
	public names = [Lang.getRef('chatCommands.info', Language.Default)];
	public deferType = CommandDeferType.HIDDEN;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
		let args = {
			option: intr.options.getString(
				Lang.getRef('arguments.option', Language.Default)
			) as InfoOption
		};

		let embed: EmbedBuilder;
		switch (args.option) {
			case InfoOption.ABOUT: {
				const e = Lang.getEmbed('displayEmbeds.about', data.lang);
				if (e.isErr()) {
					Logger.error(e.error.message + `\nInteraction ID: ${intr.id}\nUser ID: ${intr.user.id}`);
					return;
				}
				embed = e.value;
				break;
			}
			case InfoOption.TRANSLATE: {
				const e = Lang.getEmbed('displayEmbeds.translate', data.lang);
				if (e.isErr()) {
					Logger.error(e.error.message + `\nInteraction ID: ${intr.id}\nUser ID: ${intr.user.id}`);
					return;
				}
				embed = e.value;
				for (let langCode of Language.Enabled) {
					embed.addFields([
						{
							name: Language.Data[langCode].nativeName,
							value: Lang.getRef('meta.translators', langCode)
						}
					]);
				}
				break;
			}
			default: {
				return;
			}
		}

		await InteractionUtils.send(intr, embed);
	}
}
