import {
  type Guild,
  type GuildMember,
  type TextChannel,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { WAITLIST_CHANNEL_ID } from "../config.js";
import { logger } from "../../lib/logger.js";

export async function postToWaitlist(
  guild: Guild,
  member: GuildMember,
  gfxLabel: string,
  paymentLabel: string,
  priorityPass: boolean,
  formResponse: string
) {
  const channel = guild.channels.cache.get(WAITLIST_CHANNEL_ID) as TextChannel | undefined;
  if (!channel) {
    logger.warn({ channelId: WAITLIST_CHANNEL_ID }, "Waitlist channel not found");
    return;
  }

  const statusLine = "✿ pending";

  const content = [
    `_ _`,
    `_ _　✦　**new** 　order 　by: 　${member}`,
    `_ _　<a:03_l_pink_exclaim1:1518793483672883301> 　ordered: 　1x 　${gfxLabel} 　𓂃　`,
    `_ _　𐙚 　__**mop:**__ 　　${paymentLabel} 　　<a:03_a_pink_angel:1518793001613267038>`,
    `_ _　𝓹riority 　pass: 　${priorityPass ? "yes" : "no"} 　　𖧧`,
    `_ _　　➜ 　status: 　${statusLine}`,
    `_ _`,
  ].join("\n");

  const pendingBtn = new ButtonBuilder()
    .setCustomId("wl_status_pending")
    .setLabel("✿ pending")
    .setStyle(ButtonStyle.Secondary);

  const workingBtn = new ButtonBuilder()
    .setCustomId("wl_status_working")
    .setLabel("✿ working")
    .setStyle(ButtonStyle.Primary);

  const finishedBtn = new ButtonBuilder()
    .setCustomId("wl_status_finished")
    .setLabel("✿ finished")
    .setStyle(ButtonStyle.Success);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(pendingBtn, workingBtn, finishedBtn);

  const msg = await channel.send({ content, components: [row] });

  logger.info({ messageId: msg.id, user: member.user.tag }, "Waitlist entry posted");
  return msg;
}
