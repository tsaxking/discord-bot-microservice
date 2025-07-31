import express, { Express } from 'express';
import { createRequire } from 'node:module';

import { Controller } from '../controllers/index.js';
import { checkAuth, handleError } from '../middleware/index.js';
import { Logger } from '../services/index.js';
import { attemptAsync } from 'ts-utils/check';

const require = createRequire(import.meta.url);
let Config = require('../../../config/config.json');
let Logs = require('../../../config/config.json');

export class Api {
	private app: Express;

	constructor(public controllers: Controller[]) {
		this.app = express();
		this.app.use(express.json());
		this.setupControllers();
		this.app.use(handleError());
	}

	public async start() {
		return attemptAsync(async () => {
			return new Promise<void>((res, rej) => {
				this.app
					.listen(Config.api.port, () => {
						Logger.info(Logs.info.apiStarted.replaceAll('{PORT}', Config.api.port));
						res();
					})
					.on('error', (err: Error) => {
						Logger.error(Logs.error.apiStartFailed.replaceAll('{PORT}', Config.api.port), err);
						rej(err);
					});
				setTimeout(() => {
					rej(new Error(Logs.error.apiStartTimeout.replaceAll('{PORT}', Config.api.port)));
				}, 5000);
			});
		});
	}

	private setupControllers(): void {
		for (let controller of this.controllers) {
			if (controller.authToken) {
				controller.router.use(checkAuth(controller.authToken));
			}
			controller.register();
			this.app.use(controller.path, controller.router);
		}
	}
}
