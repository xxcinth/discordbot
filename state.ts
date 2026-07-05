import {
  type StringSelectMenuInteraction,
  type ButtonInteraction,
  GuildMember,
  TextChannel,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} from "discord.js";
import { channelStates } from "./state.js";
import { GFX_TYPES, PAYMENT_METHODS, FORM_TEMPLATES } from "./forms.js";
import { postToWaitlist } from "./postToWaitlist.js";
import { logger } from "../../lib/logger.js";

export async function handleGfxSelect(interaction: StringSelectMenuInteraction) {
  const state = channelStates.get(interaction.channelId);
  if (!state || state.stage !== "gfx_type" || state.userId !== interaction.user.id) {
    await interaction.reply({ content: "this selection isn't for you!", ephemeral: true });
    return;
  }

  const chosen = GFX_TYPES.find((g) => g.value === interaction.values[0]);
  if (!chosen) return;

  state.gfxType = chosen.value;
  state.gfxLabel = chosen.display;
  state.stage = "form";
  channelStates.set(interaction.channelId, state);

  const template = FORM_TEMPLATES[chosen.value] ?? "";

  await interaction.reply({
    content: `please fill out the form below and send it as your **next message**!\n\`\`\`\n${template}\n\`\`\``,
  });
}

export async function handlePaymentSelect(interaction: StringSelectMenuInteraction) {
  const state = channelStates.get(interaction.channelId);
  if (!state || state.stage !== "payment" || state.userId !== interaction.user.id) {
    await interaction.reply({ content: "this selection isn't for you!", ephemeral: true });
    return;
  }

  const chosen = PAYMENT_METHODS.find((p) => p.value === interaction.values[0]);
  if (!chosen) return;

  state.paymentValue = chosen.value;
  state.paymentLabel = chosen.display;
  state.stage = "priority";
  channelStates.set(interaction.channelId, state);

  const yesBtn = new ButtonBuilder()
    .setCustomId("priority_yes")
    .setLabel("yes")
    .setStyle(ButtonStyle.Success);

  const noBtn = new ButtonBuilder()
    .setCustomId("priority_no")
    .setLabel("no")
    .setStyle(ButtonStyle.Secondary);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(yesBtn, noBtn);

  await interaction.reply({
    content: "would you like to buy the priority pass? (price: +$5 or 500 rbx wt)",
    components: [row],
  });
}

export async function handlePriorityButton(interaction: ButtonInteraction) {
  const state = channelStates.get(interaction.channelId);
  if (!state || state.stage !== "priority" || state.userId !== interaction.user.id) {
    await interaction.reply({ content: "this button isn't for you!", ephemeral: true });
    return;
  }

  const wantsPriority = interaction.customId === "priority_yes";
  channelStates.delete(interaction.channelId);

  await interaction.update({ content: interaction.message.content, components: [] });

  const member = interaction.member as GuildMember;

  await postToWaitlist(
    interaction.guild!,
    member,
    state.gfxLabel ?? state.gfxType ?? "unknown",
    state.paymentLabel ?? state.paymentValue ?? "unknown",
    wantsPriority,
    state.formResponse ?? "(no form response)"
  );

  await (interaction.channel as TextChannel | null)?.send(
    "thank you for ordering! please wait for vani's confirmation ^^!! if you have any questions plz ask them here !"
  );

  logger.info({ user: interaction.user.tag, gfx: state.gfxLabel }, "Commission order completed");
}

export async function handleWaitlistStatusButton(interaction: ButtonInteraction) {
  const member = interaction.member as GuildMember;

  if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({ content: "only admins can update the status!", ephemeral: true });
    return;
  }

  const statusMap: Record<string, string> = {
    wl_status_pending:  "✿ pending",
    wl_status_working:  "✿ working",
    wl_status_finished: "✿ finished",
  };

  const newStatus = statusMap[interaction.customId];
  if (!newStatus) return;

  const oldContent = interaction.message.content;
  const updatedContent = oldContent.replace(
    /➜ 　status: 　✿ \S+/,
    `➜ 　status: 　${newStatus}`
  );

  await interaction.update({ content: updatedContent, components: interaction.message.components });
  logger.info({ status: newStatus }, "Waitlist status updated");
}
