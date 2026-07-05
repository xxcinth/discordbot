export const GFX_TYPES = [
  { value: "banner",  label: "♡ banner",   display: "banner" },
  { value: "textset", label: "♡ text set", display: "text set" },
  { value: "divider", label: "♡ divider",  display: "divider" },
  { value: "emotes",  label: "♡ emotes",   display: "emotes" },
  { value: "other",   label: "♡ other",    display: "other" },
];

export const PAYMENT_METHODS = [
  { value: "paypal",  label: "♡ paypal",      display: "paypal" },
  { value: "robux",   label: "♡ robux",       display: "robux" },
  { value: "deco5",   label: "♡ $5 decꪮ",    display: "$5 decꪮ" },
  { value: "nitro10", label: "♡ $10 nitrꪮ",  display: "$10 nitrꪮ" },
  { value: "admpets", label: "♡ adm pets",    display: "adm pets" },
  { value: "other",   label: "♡ other",       display: "other" },
];

export const FORM_TEMPLATES: Record<string, string> = {
  banner: `type of banner (ex: fully hand-drawn, animated): 
theme:
color scheme (image preferred): 
main text(s):
subtext(s) (optional): 
font ideas/inspo (optional):
reference photos (optional): 
any extra details: 
renders (optional, please supply if requested ^^):`,

  textset: `text(s): 
font ideas/inspo (optional):
dimensions (optional, ex: 1630x360):
theme:
color scheme: 
reference photos (optional): 
any extra details: 
renders (optional, please supply if requested ^^):`,

  divider: `theme:
color scheme: 
text(s) (if any):
dimensions (optional, ex: 1630x360):
reference photos (optional):
any extra details: 
renders (optional, please supply if requested ^^):`,

  emotes: `text or object emotes?: 
text(s) (optional): 
objects(s) (optional, please describe): 
theme: 
color scheme: 
reference photos (optional): 
any extra details:`,

  other: `type of gfx requested (ex: logo, server pfp): 
text(s) (if any): 
subtext(s) (if any): 
theme: 
color scheme: 
reference photos (optional): 
any extra details (ex: animation...):`,
};
