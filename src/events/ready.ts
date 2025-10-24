import { Client, Events } from 'discord.js';

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client: Client) {
    console.log(`✅ Bot siap! Login sebagai ${client.user?.tag}`);
    console.log(`🤖 AI Provider: ${process.env.AI_PROVIDER || 'gemini'}`);
    console.log(`📊 Serving ${client.guilds.cache.size} server(s)`);
  },
};
