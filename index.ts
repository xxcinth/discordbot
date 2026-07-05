export type TicketCategory = {
  value: string;
  label: string;
  description: string;
  emoji: string | { id: string; name: string };
  autoresponder: string;
};

export const TICKET_CATEGORIES: TicketCategory[] = [
  {
    value: "comms",
    label: "✿ comms",
    description: "commission inquiries for vani",
    emoji: { id: "1518791863610642482", name: "00_d_hello_kitty1" },
    autoresponder: ".comm",
  },
  {
    value: "partner",
    label: "✿ partner/link",
    description: "grow our community with us!",
    emoji: { id: "1518845240608297171", name: "01_b_yellow_moon" },
    autoresponder: ".link",
  },
  {
    value: "report",
    label: "✿ report",
    description: "request to report/blacklist",
    emoji: { id: "1518794394130583565", name: "05_d_teal_drink" },
    autoresponder: ".report",
  },
];

export const STAFFIES_ROLE_ID = "1515124175264813196";
export const TICKET_CATEGORY_ID = "1521895900316696706";
export const TRANSCRIPT_CHANNEL_ID = "1515459280860479719";
export const WAITLIST_CHANNEL_ID = "1515462669178634398";

export const CLAIM_EMOJI = { id: "1518842304235044995", name: "04_a_purple_heart" };
export const CLOSE_EMOJI = { id: "1518842350452080640", name: "03_i_pink_strawberry" };
