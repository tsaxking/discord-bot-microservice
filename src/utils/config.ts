import z from 'zod';

// You may add more to the config file if you please
// Be sure to alter config.schema.json and config.example.json accordingly

export default z.object({
	environment: z.enum(['dev', 'test', 'prod']),
	app_name: z.string().min(1),
	network: z
		.object({
			host: z.string().min(1),
			port: z.number().min(1).max(65535),
			protocol: z.enum(['http', 'https'])
		})
		.optional(),
	database: z.object({
		port: z.number().min(1).max(65535),
		host: z.string().min(1),
		user: z.string().min(1),
		pass: z.string().min(1),
		name: z.string().min(1)
	}),
	redis: z.object({
		url: z.string().url(),
		name: z.string().min(1)
	}),
	logs: z.object({
		enabled: z.boolean(),
		outdir: z.string(),
		level: z.array(z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent', 'struct']))
	}),
	email: z.object({
		queue_name: z.string().min(1),
		max_size: z.number().min(1),
		support_email: z.string().email()
	}),
	ntp: z.object({
		server: z.string().min(1)
	}),
	developers: z.array(z.string()),
	client: z.object({
		id: z.string(),
		token: z.string(),
		intents: z.array(z.string()),
		partials: z.array(z.string()),
		caches: z.object({
			AutoModerationRuleManager: z.number(),
			BaseGuildEmojiManager: z.number(),
			GuildBanManager: z.number(),
			GuildInviteManager: z.number(),
			MessageManager: z.number(),
			GuildScheduledEventManager: z.number(),
			GuildStickerManager: z.number(),
			PresenceManager: z.number(),
			StageInstanceManager: z.number(),
			ThreadManager: z.number(),
			ThreadMemberManager: z.number(),
			VoiceStateManager: z.number()
		})
	}),
	api: z.object({
		port: z.number(),
		secret: z.string()
	}),
	sharding: z.object({
		spawnDelay: z.number(),
		spawnTimeout: z.number(),
		serversPerShard: z.number()
	}),
	clustering: z.object({
		enabled: z.boolean(),
		shardCount: z.number(),
		callbackUrl: z.string().url(),
		masterApi: z.object({
			url: z.string().url(),
			token: z.string()
		})
	}),
	jobs: z.object({
		updateServerCount: z.object({
			schedule: z.string(),
			log: z.boolean(),
			runOnce: z.boolean(),
			initialDelaySecs: z.number()
		})
	}),
	rateLimiting: z.object({
		commands: z.object({
			amount: z.number(),
			interval: z.number()
		}),
		buttons: z.object({
			amount: z.number(),
			interval: z.number()
		}),
		triggers: z.object({
			amount: z.number(),
			interval: z.number()
		}),
		reactions: z.object({
			amount: z.number(),
			interval: z.number()
		})
	}),
	logging: z.object({
		pretty: z.boolean(),
		rateLimit: z.object({
			minTimeout: z.number()
		})
	}),
	sites: z.array(
		z.object({
			name: z.string(),
			enabled: z.boolean(),
			url: z.string().url(),
			authorization: z.string(),
			body: z.string()
		})
	),
	debug: z.object({
		shardMode: z.object({
			enabled: z.boolean(),
			value: z.string()
		}),

		dummyMode: z.object({
			enabled: z.boolean(),
			whitelist: z.array(z.string())
		})
	})
});
