const LOCALES = {
  ar: 'rtl',
}

export const LANGUAGES_LOCALIZED: Record<string, string> = {
  af: 'Afrikaans',
  ar: 'عربي',
  az: 'Azerbaijani',
  bg: 'български',
  bs: 'bosanski',
  by: 'Belarusian',
  ca: 'català',
  cn: '中国人',
  cs: 'čeština',
  cy: 'Cymraeg',
  da: 'dansk',
  de: 'Deutsch',
  el: 'Ελληνικά',
  en: 'English',
  'en-GB': 'English (UK)',
  'en-US': 'English (US)',
  eo: 'Esperanto',
  es: 'Español',
  'es-ES': 'Español (españa)',
  et: 'Estonian',
  fa: 'Persian',
  fi: 'Finnish',
  fr: 'Français',
  gu: 'Gujarati',
  he: 'Hebrew',
  hi: 'हिन्दी',
  hr: 'Croatian',
  hu: 'Hungarian',
  id: 'Bahasa Indonesia',
  it: 'Italiano',
  ja: '日本語',
  km: 'Khmer',
  ko: 'Korean',
  lt: 'Lithuanian',
  lv: 'Latvian',
  mk: 'Macedonian',
  mn: 'Mongolian',
  ms: 'Bahasa Malaysia',
  my: 'Myanmar',
  nb: 'Norwegian Bokmål',
  nl: 'Dutch',
  no: 'Norwegian',
  pl: 'Polski',
  pt: 'Português',
  'pt-BR': 'Português (Brasil)',
  'pt-PT': 'Português (Portugal)',
  pt_BR: 'Português (Brasil)',
  ro: 'Română',
  ru: 'Russian',
  sk: 'Slovak',
  sl: 'Slovenščina',
  'sr-Cyrl': 'Serbian Cyrillic',
  'sr-Latn': 'Serbian Latin',
  sv: 'Swedish',
  sw: 'Swahili',
  ta: 'Tamil',
  th: 'Thai',
  tl: 'Tagalog',
  tr: 'Turkish',
  ua: 'Ukrainian',
  uk: 'Ukrainian',
  ur: 'Urdu',
  vi: 'Vietnamese',
  zh: '简体中文',
  'zh-CN': '简体中文',
  'zh-HK': '繁體中文 (香港特別行政区)',
  'zh-Hant': '繁體中文',
  'zh-TW': '漢語',
}

export const getLocalizedLanguageName = (code = 'en'): string => LANGUAGES_LOCALIZED[code]

export const isRtl = (code = ''): boolean => {
  if (!code) return false
  const locale = code.substr(0, 2)
  return LOCALES[locale] === 'rtl'
}

export const getLanguageNameFromCode = (code = ''): string => {
  const languageNames = new Intl.DisplayNames([code || 'en'], { type: 'language' })
  return languageNames.of(code) || ''
}
