import { Shard, ShardingManager } from 'discord.js';
import { createRequire } from 'node:module';

import { JobService, Logger } from '../services/index.js';
import { attemptAsync } from 'ts-utils/check';

const require = createRequire(import.meta.url);
let Config = require('../../../config/config.json');
let Debug = require('../../../config/debug.json');
let Logs = require('../../../config/config.json');

export class Manager {
	constructor(
		private shardManager: ShardingManager,
		private jobService: JobService
	) {}

	public start() {
		return attemptAsync(async () => {
			this.registerListeners();

			let shardList = this.shardManager.shardList as number[];

			Logger.info(
				Logs.info.managerSpawningShards
					.replaceAll('{SHARD_COUNT}', shardList.length.toLocaleString())
					.replaceAll('{SHARD_LIST}', shardList.join(', '))
			);
			await this.shardManager.spawn({
				amount: this.shardManager.totalShards,
				delay: Config.sharding.spawnDelay * 1000,
				timeout: Config.sharding.spawnTimeout * 1000
			});
			Logger.info(Logs.info.managerAllShardsSpawned);

			if (Debug.dummyMode.enabled) {
				return;
			}

			this.jobService.start();
		});
	}

	private registerListeners(): void {
		this.shardManager.on('shardCreate', (shard) => this.onShardCreate(shard));
	}

	private onShardCreate(shard: Shard): void {
		Logger.info(Logs.info.managerLaunchedShard.replaceAll('{SHARD_ID}', shard.id.toString()));
	}
}
