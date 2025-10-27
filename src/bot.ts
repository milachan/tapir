import { Client, GatewayIntentBits, Collection } from 'discord.js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

// Extend Client type to include commands collection
declare module 'discord.js' {
  export interface Client {
    commands: Collection<string, any>;
  }
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers, // For welcome messages
  ],
});

// Initialize commands collection
client.commands = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
  
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      console.log(`✅ Loaded command: ${command.data.name}`);
    }
  }
}

// Load events
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
  
  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    
    // Clear cache untuk prevent double load
    delete require.cache[require.resolve(filePath)];
    
    const event = require(filePath);
    
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
      console.log(`✅ Loaded event: ${event.name} (once)`);
    } else {
      client.on(event.name, (...args) => event.execute(...args));
      console.log(`✅ Loaded event: ${event.name}`);
    }
  }
}

// Helper function to clean environment variables
function cleanEnv(value: string | undefined): string | undefined {
  if (!value) return value;
  return value.trim().replace(/^["']|["']$/g, '');
}

// Global error handlers
process.on('unhandledRejection', (error: Error) => {
  console.error('❌ [CRITICAL] Unhandled Promise Rejection:', error);
  console.error('Stack:', error.stack);
  // Don't exit, just log the error
});

process.on('uncaughtException', (error: Error) => {
  console.error('❌ [CRITICAL] Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  // Exit gracefully
  console.log('🔄 Attempting graceful shutdown...');
  client.destroy();
  process.exit(1);
});

// Graceful shutdown handlers
process.on('SIGINT', () => {
  console.log('🛑 [SIGINT] Received SIGINT signal, shutting down gracefully...');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 [SIGTERM] Received SIGTERM signal, shutting down gracefully...');
  client.destroy();
  process.exit(0);
});

// Discord client error handler
client.on('error', (error) => {
  console.error('❌ [DISCORD] Client error:', error);
});

client.on('warn', (warning) => {
  console.warn('⚠️ [DISCORD] Client warning:', warning);
});

// Login to Discord
const discordToken = cleanEnv(process.env.DISCORD_TOKEN);
console.log('🔑 Discord Token loaded:', discordToken ? 'Yes' : 'No');

client.login(discordToken).catch((error) => {
  console.error('❌ [CRITICAL] Failed to login to Discord:', error);
  process.exit(1);
});
