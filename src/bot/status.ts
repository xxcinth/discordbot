import {
  type TextChannel,
  type ButtonInteraction,
  GuildMember,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} from "discord.js";
import { logger } from "../lib/logger.js";

const STATUS_ROLE_ID = "1515122174749442139";
const COMMS_CHANNEL_ID = "1515461582505906289";

const OPEN_EMOJI = { id: "1518793985252921354", name: "03_m_pink_heart2" };
const CLOSED_EMOJI = { id: "1518844815008071773", name: "05_k_teal_bear" };

function getDateString(): string {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(2);
  return `${mm}/${dd}/${yy}`;
}

function buildStatusButtons(): ActionRowBuilder<ButtonBuilder> {
  const openBtn = new ButtonBuilder()
    .setCustomId("status_open")
    .setLabel("✿ open")
    .setStyle(ButtonStyle.Secondary)
    .setEmoji({ id: OPEN_EMOJI.id, name: OPEN_EMOJI.name });

  const closedBtn = new ButtonBuilder()
    .setCustomId("status_closed")
    .setLabel("✿ closed")
    .setStyle(ButtonStyle.Secondary)
    .setEmoji({ id: CLOSED_EMOJI.id, name: CLOSED_EMOJI.name });

  return new ActionRowBuilder<ButtonBuilder>().addComponents(openBtn, closedBtn);
}

function buildOpenContent(date: string): string {
  return [
    `_ _　<@&${STATUS_ROLE_ID}>　　**'s** 　　__status__ 　　<a:04_d_purple_dvd:1518838203187200030>`,
    `_ _ `,
    `_ _　<a:03_j_pink_arrow:1518793597254766622>　　as　　of 　　**${date}** 　　vani　　is　　. . .`,
    `_ _　ৎ　　**OPEN** 　: 　go 　to 　<#${COMMS_CHANNEL_ID}>　now!`,
  ].join("\n");
}

function buildClosedContent(date: string): string {
  return [
    `_ _　<@&${STATUS_ROLE_ID}>　　**'s** 　　__status__ 　　<a:04_d_purple_dvd:1518838203187200030>`,
    `_ _ `,
    `_ _　<a:03_j_pink_arrow:1518793597254766622>　　as　　of 　　**${date}** 　　vani　　is　　. . .`,
    `_ _　ৎ　　**CLOSED** 　: 　please 　wait 　until 　next 　time!`,
  ].join("\n");
}

export async function sendStatusPanel(channel: TextChannel): Promise<void> {
  const date = getDateString();
  const content = buildClosedContent(date);
  const row = buildStatusButtons();
  await channel.send({ content, components: [row] });
  logger.info({ channel: channel.name }, "Status panel sent");
}

export async function handleStatusButton(interaction: ButtonInteraction): Promise<void> {
  const member = interaction.member as GuildMember;

  if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({ content: "only admins can update the status!", ephemeral: true });
    return;
  }

  const date = getDateString();
  const isOpen = interaction.customId === "status_open";
  const content = isOpen ? buildOpenContent(date) : buildClosedContent(date);
  const row = buildStatusButtons();

  await interaction.update({ content, components: [row] });
  logger.info({ status: isOpen ? "open" : "closed" }, "Commission status updated");
}
