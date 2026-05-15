interface IDetectLanguages {
  [key: string]: string[];
}

const languages: IDetectLanguages = {
  multilingual: ["multi"],
  arabic: [
    "ar",
    "ar-AE",
    "ar-SA",
    "ar-QA",
    "ar-KW",
    "ar-SY",
    "ar-LB",
    "ar-PS",
    "ar-JO",
    "ar-EG",
    "ar-SD",
    "ar-TD",
    "ar-MA",
    "ar-DZ",
    "ar-TN",
    "ar-IQ",
    "ar-IR",
  ],

  belarusian: ["be"],
  bengali: ["bn"],
  bosnian: ["bs"],
  bulgarian: ["bg"],
  catalan: ["ca"],
  croatian: ["hr"],
  czech: ["cs"],
  danish: ["da", "da-DK"],
  dutch: ["nl"],
  english: ["en", "en-US", "en-AU", "en-GB", "en-IN", "en-NZ"],
  estonian: ["et"],
  finnish: ["fi"],
  flemish: ["nl-BE"],
  french: ["fr", "fr-CA"],
  german: ["de"],
  german_switzerland: ["de-CH"],
  greek: ["el"],
  hebrew: ["he"],
  hindi: ["hi"],
  hungarian: ["hu"],
  indonesian: ["id"],
  italian: ["it"],
  japanese: ["ja"],
  kannada: ["kn"],
  korean: ["ko", "ko-KR"],
  latvian: ["lv"],
  lithuanian: ["lt"],
  macedonian: ["mk"],
  malay: ["ms"],
  marathi: ["mr"],
  norwegian: ["no"],
  persian: ["fa"],
  polish: ["pl"],
  portuguese: ["pt", "pt-BR", "pt-PT"],
  romanian: ["ro"],
  russian: ["ru"],
  serbian: ["sr"],
  slovak: ["sk"],
  slovenian: ["sl"],
  spanish: ["es", "es-419"],
  swedish: ["sv", "sv-SE"],
  tagalog: ["tl"],
  tamil: ["ta"],
  telugu: ["te"],
  turkish: ["tr"],
  ukrainian: ["uk"],
  urdu: ["ur"],
  vietnamese: ["vi"],
};

export const getLanguageFromCode = (code: string) => {
  const langs = Object.keys(languages);
  const language = langs.find((lang) => languages[lang].includes(code));
  return language;
};

export default languages;
