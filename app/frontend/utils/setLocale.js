const setLocale = () => {
  window.I18n.locale = document.body.dataset.locale || window.I18n.locale
}

export default setLocale
