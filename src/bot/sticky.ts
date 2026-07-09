import { type Message, type TextChannel } from "discord.js";
import { logger } from "../lib/logger.js";

interface StickyEntry {
  messageId: string;
  content: string;
}

const stickyMessages = new Map<string, StickyEntry>();
const repostCooldown = new Set<string>();

export const REVIEW_STICKY_CONTENT = [
  `**✿  review template:**`,
  ``,
  `𝄞  　　**[name]'s** review for @vaniphobic　 ❀`,
  `˚　　ꮼ　　type of gfx ordered:　‿‿`,
  `ᕱ.ᕱ   　 　quality of work: (rating + optional commentary)`,
  `࿐  　 　customer service: (rating + optional commentary)`,
  `_ _　𓎟𓎟 　 　any extra comments:`,
].join("\n");

export const ASK_STICKY_CONTENT = `<a:03_l_pink_exclaim1:1518793483672883301>  **ping** @vaniphobic for any questions; vani will get back to you asap! please __avoid__ spam + troll questions! personal questions : <#1515461582505906289>`;

export async function setStickyMessage(channel: TextChannel, content: string): Promise<void> {
  const existing = stickyMessages.get(channel.id);
  if (existing) {
    const old = await channel.messages.fetch(existing.messageId).catch(() => null);
    if (old) await old.delete().catch(() => {});
  }

  const msg = await channel.send(content);
  stickyMessages.set(channel.id, { messageId: msg.id, content });
  logger.info({ channelId: channel.id }, "Sticky message set");
}

export async function handleStickyOnMessage(message: Message): Promise<void> {
  if (message.author.bot) return;

  const channelId = message.channelId;
  const sticky = stickyMessages.get(channelId);
  if (!sticky) return;

  if (repostCooldown.has(channelId)) return;
  repostCooldown.add(channelId);
  setTimeout(() => repostCooldown.delete(channelId), 2000);

  const channel = message.channel as TextChannel;

  const old = await channel.messages.fetch(sticky.messageId).catch(() => null);
  if (old) await old.delete().catch(() => {});

  const newMsg = await channel.send(sticky.content);
  stickyMessages.set(channelId, { messageId: newMsg.id, content: sticky.content });
  logger.info({ channelId }, "Sticky message reposted");
}
