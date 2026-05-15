type ILanguageName =
  | "English (American)"
  | "English (British)"
  | "Spanish"
  | "French"
  | "German"
  | "Portuguese"
  | "Italian"
  | "Chinese (Mandarin)"
  | "Japanese"
  | "Korean"
  | "Russian"
  | "Arabic"
  | "Hindi"
  | "Bengali"
  | "Urdu"
  | "Turkish"
  | "Vietnamese"
  | "Thai"
  | "Dutch"
  | "Persian (Farsi)"
  | "Malay"
  | "Hausa"
  | "Igbo";

type ILanguageCode =
  | "en-US"
  | "en-GB"
  | "es"
  | "fr"
  | "de"
  | "pt"
  | "it"
  | "zh"
  | "ja"
  | "ko"
  | "ru"
  | "ar"
  | "hi"
  | "bn"
  | "ur"
  | "tr"
  | "vi"
  | "th"
  | "nl"
  | "fa"
  | "ms"
  | "ha"
  | "ig";

export interface ITranslateLanguages {
  name: ILanguageName;
  code: ILanguageCode;
}

const languages: ITranslateLanguages[] = [
  { name: "English (American)", code: "en-US" },
  { name: "English (British)", code: "en-GB" },
  { name: "Hausa", code: "ha" },
  { name: "Igbo", code: "ig" },
  { name: "Spanish", code: "es" },
  { name: "French", code: "fr" },
  { name: "German", code: "de" },
  { name: "Portuguese", code: "pt" },
  { name: "Italian", code: "it" },
  { name: "Chinese (Mandarin)", code: "zh" },
  { name: "Japanese", code: "ja" },
  { name: "Korean", code: "ko" },
  { name: "Russian", code: "ru" },
  { name: "Arabic", code: "ar" },
  { name: "Hindi", code: "hi" },
  { name: "Bengali", code: "bn" },
  { name: "Urdu", code: "ur" },
  { name: "Turkish", code: "tr" },
  { name: "Vietnamese", code: "vi" },
  { name: "Thai", code: "th" },
  { name: "Dutch", code: "nl" },
  { name: "Persian (Farsi)", code: "fa" },
  { name: "Malay", code: "ms" },
];

export const getTranslateLanguageFromCode = (code: string) => {
  const language = languages.find((lang) => lang.code === code);
  return language?.name;
};

export default languages;
