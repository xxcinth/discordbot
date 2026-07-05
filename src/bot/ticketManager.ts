import {
  type Guild,
  type TextChannel,
  type GuildMember,
  type OverwriteResolvable,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
} from "discord.js";
import {
  TICKET_CATEGORIES,
  TICKET_CATEGORY_ID,
  STAFFIES_ROLE_ID,
  TRANSCRIPT_CHANNEL_ID,
  CLAIM_EMOJI,
  CLOSE_EMOJI,
} from "./config.js";
import { logger } from "../lib/logger.js";

const openTickets = new Map<string, string>();

export async function openTicket(
  guild: Guild,
  member: GuildMember,
  categoryValue: string
) {
  const existing = openTickets.get(member.id);
  if (existing) {
    const ch = guild.channels.cache.get(existing) as TextChannel | undefined;
    if (ch) return { channel: ch, isNew: false };
    openTickets.delete(member.id);
  }

  const cat = TICKET_CATEGORIES.find((c) => c.value === categoryValue);

  const permissionOverwrites: OverwriteResolvable[] = [
    {
      id: guild.roles.everyone.id,
      deny: [PermissionFlagsBits.ViewChannel],
    },
    {
      id: member.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.AttachFiles,
      ],
    },
    {
      id: STAFFIES_ROLE_ID,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.ManageMessages,
      ],
    },
  ];

  const channel = await guild.channels.create({
    name: `ticket-${member.user.username}`,
    type: ChannelType.GuildText,
    parent: TICKET_CATEGORY_ID,
    topic: `ticket for ${member.user.tag} | category: ${cat?.label ?? categoryValue}`,
    permissionOverwrites,
  });

  openTickets.set(member.id, channel.id);

  const autoresponder = cat?.autoresponder ?? ".help";

  const embed = new EmbedBuilder()
    .setTitle("ticket opened")
    .setDescription(
      `hello ${member}, thank you for reaching out!\n\n**category:** ${cat?.label ?? categoryValue}\n\n♡ please use the autoresponder \`${autoresponder}\` to continue`
    )
    .setColor(0xffd9eb);

  const claimButton = new ButtonBuilder()
    .setCustomId("claim_ticket")
    .setLabel("Claim Ticket")
    .setStyle(ButtonStyle.Success)
    .setEmoji({ id: CLAIM_EMOJI.id, name: CLAIM_EMOJI.name });

  const closeButton = new ButtonBuilder()
    .setCustomId("close_ticket")
    .setLabel("Close Ticket")
    .setStyle(ButtonStyle.Danger)
    .setEmoji({ id: CLOSE_EMOJI.id, name: CLOSE_EMOJI.name });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(claimButton, closeButton);

  await channel.send({
    content: `<@${member.id}> <@&${STAFFIES_ROLE_ID}>`,
    embeds: [embed],
    components: [row],
  });

  logger.info({ userId: member.id, channel: channel.name }, "Ticket opened");
  return { channel, isNew: true };
}

export async function closeTicket(
  guild: Guild,
  channel: TextChannel,
  closedBy: GuildMember
) {
  const entry = [...openTickets.entries()].find(([, chId]) => chId === channel.id);
  if (entry) openTickets.delete(entry[0]);

  const embed = new EmbedBuilder()
    .setTitle("ticket closed")
    .setDescription(
      `this ticket was closed by ${closedBy}.\n\nthis channel will be deleted in **5 seconds**.`
    )
    .setColor(0xffd9eb)
    .setTimestamp();

  await channel.send({ embeds: [embed] });
  await logTranscript(guild, channel, closedBy);

  setTimeout(() => {
    channel.delete("Ticket closed").catch(() => {});
  }, 5000);

  logger.info({ channel: channel.name, closedBy: closedBy.user.tag }, "Ticket closed");
}

async function logTranscript(guild: Guild, channel: TextChannel, closedBy: GuildMember) {
  const logChannel = guild.channels.cache.get(TRANSCRIPT_CHANNEL_ID) as TextChannel | undefined;

  if (!logChannel) {
    logger.warn({ channelId: TRANSCRIPT_CHANNEL_ID }, "Transcript channel not found");
    return;
  }

  const messages = await channel.messages.fetch({ limit: 100 });
  const sorted = [...messages.values()].reverse();

  const transcript = sorted
    .map(
      (m) =>
        `[${m.createdAt.toISOString()}] ${m.author.tag}: ${m.content || "(attachment/embed)"}`
    )
    .join("\n");

  const embed = new EmbedBuilder()
    .setTitle("ticket transcript")
    .setDescription(
      `**channel:** ${channel.name}\n**closed by:** ${closedBy.user.tag}\n**messages:** ${sorted.length}`
    )
    .setColor(0xffd9eb)
    .setTimestamp();

  await logChannel.send({
    embeds: [embed],
    files: transcript
      ? [
          {
            attachment: Buffer.from(transcript, "utf-8"),
            name: `${channel.name}-transcript.txt`,
          },
        ]
      : [],
  });
}

export function isTicketChannel(channelId: string) {
  return [...openTickets.values()].includes(channelId);
}
