import { MessageContextMenuCommandInteraction, PermissionsString } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { DateTime } from 'luxon';

import { Language } from '../../models/enum-helpers/index.js';
import { EventData } from '../../models/internal-models.js';
import { Lang, Logger } from '../../services/index.js';
import { InteractionUtils } from '../../utils/index.js';
import { Command, CommandDeferType } from '../index.js';

export class ViewDateSent implements Command {
	public names = [Lang.getRef('messageCommands.viewDateSent', Language.Default)];
	public cooldown = new RateLimiter(1, 5000);
	public deferType = CommandDeferType.HIDDEN;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(intr: MessageContextMenuCommandInteraction, data: EventData): Promise<void> {
		const embed = Lang.getEmbed('displayEmbeds.viewDateSent', data.lang, {
			TARGET: intr.targetMessage.author.toString(),
			DATE: DateTime.fromJSDate(intr.targetMessage.createdAt).toLocaleString(DateTime.DATE_HUGE)
		});
		if (embed.isErr()) {
			Logger.error(embed.error.message + `\nInteraction ID: ${intr.id}\nUser ID: ${intr.user.id}`);
			return;
		}
		await InteractionUtils.send(intr, embed.value);
	}
}
