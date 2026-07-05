import {
  type Interaction,
  type StringSelectMenuInteraction,
  type ButtonInteraction,
  type ChatInputCommandInteraction,
  GuildMember,
  TextChannel,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
} from "discord.js";
import { openTicket, closeTicket } from "./ticketManager.js";
import { sendTicketPanel } from "./setupPanel.js";
import { sendStatusPanel, handleStatusButton } from "./status.js";
import { CLAIM_EMOJI } from "./config.js";
import {
  handleGfxSelect,
  handlePaymentSelect,
  handlePriorityButton,
  handleWaitlistStatusButton,
} from "./waitlist/interactionHandler.js";
import { logger } from "../lib/logger.js";

export async function handleInteraction(interaction: Interaction) {
  if (!interaction.guild || !interaction.member) return;

  try {
    if (interaction.isStringSelectMenu()) {
      await handleSelectMenu(interaction as StringSelectMenuInteraction);
    } else if (interaction.isButton()) {
      await handleButton(interaction as ButtonInteraction);
    } else if (interaction.isChatInputCommand()) {
      await handleCommand(interaction as ChatInputCommandInteraction);
    }
  } catch (err) {
    logger.error({ err }, "Error handling interaction");
    const reply = { content: "an error occurred. please try again.", ephemeral: true };
    if (interaction.isRepliable()) {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply);
      } else {
        await interaction.reply(reply);
      }
    }
  }
}

async function handleSelectMenu(interaction: StringSelectMenuInteraction) {
  switch (interaction.customId) {
    case "open_ticket":
      await handleOpenTicket(interaction);
      break;
    case "gfx_select":
      await handleGfxSelect(interaction);
      break;
    case "payment_select":
      await handlePaymentSelect(interaction);
      break;
  }
}

async function handleOpenTicket(interaction: StringSelectMenuInteraction) {
  await interaction.deferReply({ ephemeral: true });
  const member = interaction.member as GuildMember;
  const categoryValue = interaction.values[0];

  const { channel, isNew } = await openTicket(interaction.guild!, member, categoryValue);

  if (isNew) {
    await interaction.editReply({ content: `✅ your ticket has been created: ${channel}` });
  } else {
    await interaction.editReply({ content: `ℹ️ you already have an open ticket: ${channel}` });
  }
}

async function handleButton(interaction: ButtonInteraction) {
  const member = interaction.member as GuildMember;
  const channel = interaction.channel as TextChannel;

  if (interaction.customId === "close_ticket") {
    await interaction.deferReply();
    await closeTicket(interaction.guild!, channel, member);
  } else if (interaction.customId === "claim_ticket") {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `<:${CLAIM_EMOJI.name}:${CLAIM_EMOJI.id}> **${member.displayName}** has claimed this ticket and will be assisting you shortly!`
          )
          .setColor(0xffd9eb),
      ],
    });
  } else if (interaction.customId === "priority_yes" || interaction.customId === "priority_no") {
    await handlePriorityButton(interaction);
  } else if (interaction.customId.startsWith("wl_status_")) {
    await handleWaitlistStatusButton(interaction);
  } else if (interaction.customId === "status_open" || interaction.customId === "status_closed") {
    await handleStatusButton(interaction);
  }
}

async function handleCommand(interaction: ChatInputCommandInteraction) {
  const member = interaction.member as GuildMember;
  const channel = interaction.channel as TextChannel;

  switch (interaction.commandName) {
    case "setup-tickets": {
      if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
        await interaction.reply({
          content: "❌ you need administrator permission to use this.",
          ephemeral: true,
        });
        return;
      }
      await interaction.deferReply({ ephemeral: true });
      await sendTicketPanel(channel);
      await interaction.editReply({ content: "✅ ticket panel sent!" });
      break;
    }

    case "close-ticket": {
      if (!channel.name.startsWith("ticket-")) {
        await interaction.reply({
          content: "❌ this command can only be used inside a ticket channel.",
          ephemeral: true,
        });
        return;
      }
      await interaction.deferReply();
      await closeTicket(interaction.guild!, channel, member);
      break;
    }

    case "add-user": {
      if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
        await interaction.reply({
          content: "❌ you need administrator permission to use this.",
          ephemeral: true,
        });
        return;
      }
      const target = interaction.options.getMember("user") as GuildMember;
      if (!target) {
        await interaction.reply({ content: "❌ user not found.", ephemeral: true });
        return;
      }
      await channel.permissionOverwrites.create(target.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
      });
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`✅ ${target} has been added to this ticket.`)
            .setColor(Colors.Green),
        ],
      });
      break;
    }

    case "remove-user": {
      if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
        await interaction.reply({
          content: "❌ you need administrator permission to use this.",
          ephemeral: true,
        });
        return;
      }
      const target = interaction.options.getMember("user") as GuildMember;
      if (!target) {
        await interaction.reply({ content: "❌ user not found.", ephemeral: true });
        return;
      }
      await channel.permissionOverwrites.delete(target.id);
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`✅ ${target} has been removed from this ticket.`)
            .setColor(Colors.Red),
        ],
      });
      break;
    }

    case "setup-status": {
      if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
        await interaction.reply({
          content: "❌ you need administrator permission to use this.",
          ephemeral: true,
        });
        return;
      }
      await interaction.deferReply({ ephemeral: true });
      await sendStatusPanel(channel);
      await interaction.editReply({ content: "✅ status panel sent!" });
      break;
    }
  }
}
