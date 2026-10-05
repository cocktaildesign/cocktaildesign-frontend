// Shared public details: existing requisites page and the current main-site documents.
export const company = {
  name: "Индивидуальный предприниматель Кравец Дмитрий Михайлович",
  inn: "510999203433",
  ogrnip: "318784700202833",
  registrationAddress: "191040, Россия, г. Санкт-Петербург, ул. 9-я Советская, д. 10–12, лит. А, кв. 29",
  officeAddress: "Россия, г. Санкт-Петербург, ул. Уральская, д. 19, корп. 8, бизнес-центр «Урал Плаза», офис 120",
  email: "cocktaildesign@yandex.ru",
  phone: "+7 (995) 622-62-02",
  account: "40802810601500251152",
  bank: "ООО «Банк Точка»",
  bik: "044525104",
  correspondentAccount: "30101810745374525104",
} as const;

export const LEGAL_VERSION = "2026-10-05";
export const FEEDBACK_CONSENT_TEXT = "Даю согласие на обработку персональных данных для рассмотрения обращения и ответа на него.";

export function legalText(text: string): string {
  return text.replace(/\{\{(\w+)\}\}/g, (token, key: string) => company[key as keyof typeof company] ?? token);
}
