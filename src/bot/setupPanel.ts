import {
  type TextChannel,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { TICKET_CATEGORIES } from "./config.js";
import { logger } from "../lib/logger.js";

export async function sendTicketPanel(channel: TextChannel) {
  const select = new StringSelectMenuBuilder()
    .setCustomId("open_ticket")
    .setPlaceholder("Select a category to open a ticket…")
    .addOptions(
      TICKET_CATEGORIES.map((cat) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(cat.label)
          .setValue(cat.value)
          .setDescription(cat.description)
          .setEmoji(
            typeof cat.emoji === "string"
              ? cat.emoji
              : { id: cat.emoji.id, name: cat.emoji.name }
          )
      )
    );

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

  await channel.send({ components: [row] });
  logger.info({ channel: channel.name }, "Ticket panel sent");
}
