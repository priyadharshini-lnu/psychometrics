const LOCALES = {
  ar: 'rtl',
}

export const isRtl = (code: string): boolean => {
  const locale = code.substr(0, 2)
  return LOCALES[locale] === 'rtl'
}
