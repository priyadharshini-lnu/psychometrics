const { I18n, $ } = window

const LOCALES = {
  ar: 'rtl',
}

export const isRtl = (code: string): boolean => {
  const locale = code.substr(0, 2)
  return LOCALES[locale] === 'rtl'
}

export const setLocale = (code: string): void => {
  I18n.locale = code
  $('body').data('locale', code)
  $('body').toggleClass('rtl', isRtl(code))
}
