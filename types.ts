import {
  type Message,
  type TextChannel,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ChannelType,
} from "discord.js";
import { channelStates } from "./state.js";
import { GFX_TYPES, FORM_TEMPLATES } from "./forms.js";
import { logger } from "../../lib/logger.js";

export async function handleMessage(message: Message) {
  if (message.author.bot) return;
  if (!message.guild) return;
  if (message.channel.type !== ChannelType.GuildText) return;

  const channel = message.channel as TextChannel;
  if (!channel.name.startsWith("ticket-")) return;

  const channelId = message.channelId;
  const state = channelStates.get(channelId);
  const content = message.content.trim().toLowerCase();

  if (content === ".comm") {
    channelStates.set(channelId, {
      stage: "tos",
      userId: message.author.id,
      userTag: message.author.tag,
    });

    await channel.send(
      `please make sure to check out [vani's tos](https://vanistos.carrd.co/) before ordering! confirm that you have read by typing the command \`.confirm\``
    );
    return;
  }

  if (content === ".confirm") {
    if (!state || state.stage !== "tos" || state.userId !== message.author.id) return;

    state.stage = "gfx_type";
    channelStates.set(channelId, state);

    const select = new StringSelectMenuBuilder()
      .setCustomId("gfx_select")
      .setPlaceholder("what type of gfx are you looking for?")
      .addOptions(
        GFX_TYPES.map((g) =>
          new StringSelectMenuOptionBuilder().setLabel(g.label).setValue(g.value)
        )
      );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

    await channel.send({
      content: "what type of gfx are you looking for?",
      components: [row],
    });
    return;
  }

  if (state && state.stage === "form" && state.userId === message.author.id) {
    state.formResponse = message.content;
    state.stage = "payment";
    channelStates.set(channelId, state);

    const paymentMethods = [
      { value: "paypal",  label: "♡ paypal" },
      { value: "robux",   label: "♡ robux" },
      { value: "deco5",   label: "♡ $5 decꪮ" },
      { value: "nitro10", label: "♡ $10 nitrꪮ" },
      { value: "admpets", label: "♡ adm pets" },
      { value: "other",   label: "♡ other" },
    ];

    const select = new StringSelectMenuBuilder()
      .setCustomId("payment_select")
      .setPlaceholder("what method will you be paying with?")
      .addOptions(
        paymentMethods.map((p) =>
          new StringSelectMenuOptionBuilder().setLabel(p.label).setValue(p.value)
        )
      );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

    await channel.send({
      content: "what method will you be paying with?",
      components: [row],
    });

    logger.info({ channelId, user: message.author.tag }, "Form response captured");
    return;
  }
}
