
const { I18n } = window
export const browserCheckErrorMessage = {
  browserVersion: {
    title: I18n.t('enduser.browser_version_fix_title'),
    description: [
      I18n.t('enduser.browser_version_fix_description_first'),
      I18n.t('enduser.browser_version_fix_description_second'),
      I18n.t('enduser.browser_version_fix_description_third'),
    ],
  },
  webGL: {
    title: I18n.t('enduser.webgl_api_fix_title'),
    description: [
      I18n.t('enduser.webgl_api_fix_description_first'),
      I18n.t('enduser.webgl_api_fix_description_second'),
    ],
  },
  mediaRecorderAPI: {
    title: I18n.t('enduser.media_recorder_api_fix_title'),
    description: [
      I18n.t('enduser.media_recorder_api_fix_description_first'),
      I18n.t('enduser.media_recorder_api_fix_description_second'),
      I18n.t('enduser.media_recorder_api_fix_description_third'),
    ],
  },
  localStorage: {
    title: I18n.t('enduser.localstorage_fix_title'),
    description: [
      I18n.t('enduser.localstorage_fix_description_first'),
    ],
  },
}

export enum BrowserCheckType {
  browserVersion = 'browserVersion',
  webGL = 'webGL',
  mediaRecorderAPI = 'mediaRecorderAPI',
  localStorage = 'localStorage',
}

export const MIN_BROWSER_VERSIONS = {
  Chrome: 144,
  Firefox: 148,
  Safari: 26,
  Edge: 145,
}
