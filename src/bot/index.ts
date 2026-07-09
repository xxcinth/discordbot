import { Client, GatewayIntentBits, Partials, Events, ActivityType } from "discord.js";
import { registerCommands } from "./commands.js";
import { handleInteraction } from "./handlers.js";
import { handleMessage } from "./waitlist/messageHandler.js";
import { handleStickyOnMessage } from "./sticky.js";
import { logger } from "../lib/logger.js";

export function startBot() {
  const token = process.env["DISCORD_TOKEN"];
  const clientId = process.env["DISCORD_CLIENT_ID"];
  const guildId = process.env["DISCORD_GUILD_ID"];

  if (!token || !clientId || !guildId) {
    logger.error("Missing DISCORD_TOKEN, DISCORD_CLIENT_ID, or DISCORD_GUILD_ID");
    process.exit(1);
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel, Partials.Message],
  });

  client.once(Events.ClientReady, async (readyClient) => {
    logger.info({ tag: readyClient.user.tag }, "Discord bot ready");
    readyClient.user.setActivity("📋 Support Tickets", { type: ActivityType.Watching });
    await registerCommands(token, clientId, guildId);
  });

  client.on(Events.InteractionCreate, handleInteraction);

  client.on(Events.MessageCreate, async (message) => {
    await handleMessage(message);
    await handleStickyOnMessage(message);
  });

  client.on(Events.Error, (err) => {
    logger.error({ err }, "Discord client error");
  });

  client.login(token).catch((err) => {
    logger.error({ err }, "Failed to login to Discord");
    process.exit(1);
  });

  return client;
}
