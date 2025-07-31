import { Client, GatewayIntentBits } from 'discord.js';import { config } from 'dotenv';
config();

export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, // needed to read message bodies
    ],
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user?.tag}!`);
});
client.on('messageCreate', (message) => {
  if (message.content === '!ping') {
    message.reply('Pong!');
  }
});


client.login(process.env.DISCORD_TOKEN);