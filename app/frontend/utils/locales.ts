const LOCALES = {
  ar: 'rtl',
}

export const isRtl = (code = ''): boolean => {
  if (!code) return false
  const locale = code.substr(0, 2)
  return LOCALES[locale] === 'rtl'
}

export const getLanguageNameFromCode = (code = ''): string => {
  const languageNames = new Intl.DisplayNames([code || 'en'], { type: 'language' })
  return languageNames.of(code) || ''
}
