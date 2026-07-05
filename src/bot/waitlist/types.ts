export type WaitlistStage = "tos" | "gfx_type" | "form" | "payment" | "priority";

export interface WaitlistState {
  stage: WaitlistStage;
  userId: string;
  userTag: string;
  gfxType?: string;
  gfxLabel?: string;
  formResponse?: string;
  paymentValue?: string;
  paymentLabel?: string;
}
