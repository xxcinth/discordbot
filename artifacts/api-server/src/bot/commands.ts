import {
  REST,
  Routes,
  SlashCommandBuilder,
} from "discord.js";
import { logger } from "../lib/logger.js";

const commands = [
  new SlashCommandBuilder()
    .setName("setup-tickets")
    .setDescription("Send the ticket panel to this channel (Admin only)")
    .toJSON(),
  new SlashCommandBuilder()
    .setName("close-ticket")
    .setDescription("Close the current ticket channel")
    .toJSON(),
  new SlashCommandBuilder()
    .setName("add-user")
    .setDescription("Add a user to this ticket")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("The user to add").setRequired(true)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName("remove-user")
    .setDescription("Remove a user from this ticket")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("The user to remove").setRequired(true)
    )
    .toJSON(),
];

export async function registerCommands(token: string, clientId: string, guildId: string) {
  const rest = new REST({ version: "10" }).setToken(token);
  try {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });
    logger.info("Slash commands registered");
  } catch (err) {
    logger.error({ err }, "Failed to register slash commands");
  }
}
