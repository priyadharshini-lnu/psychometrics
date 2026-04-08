
const { I18n } = window

export enum CHECKS {
  browser = I18n.t('enduser.browser_compatibility_result'),
  network = I18n.t('enduser.internet_speed'),
  video = I18n.t('enduser.camera'),
}
