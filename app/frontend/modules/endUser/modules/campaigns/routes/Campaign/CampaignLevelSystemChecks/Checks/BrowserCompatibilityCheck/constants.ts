
import { BROWSER_NAME } from '~/utils/uaParser'

const { I18n } = window

export const BROWSER_NOT_PROCTORING_COMPATIBLE = ['Safari', 'Firefox']

export const browserIncompatibleWithProctoringMessage = {
  title: I18n.t('enduser.browser_proctoring_title', { browser_name: BROWSER_NAME }),
  description: [I18n.t('enduser.browser_proctoring_description', { browser_name: BROWSER_NAME })],
}

export const MIN_BROWSER_VERSIONS = {
  Chrome: 144,
  'Mobile Chrome': 144,
  'Mobile Safari': 26,
  'Mobile Firefox': 148,
  Firefox: 148,
  Safari: 26,
  Edge: 145,
}

export const browserCheckErrorMessage = {
  browserVersion: {
    ...(MIN_BROWSER_VERSIONS[BROWSER_NAME] ? {
      title: I18n.t('enduser.browser_version_fix_title', {
        browser_name: BROWSER_NAME,
        updated_version: MIN_BROWSER_VERSIONS[BROWSER_NAME],
      }),
      description: [
        I18n.t('enduser.browser_version_fix_description_first', {
          browser_name: BROWSER_NAME,
          updated_version: MIN_BROWSER_VERSIONS[BROWSER_NAME],
        }),
      ],
    } : {
      title: I18n.t('enduser.browser_not_compatible', { browser_name: BROWSER_NAME }),
      description: [
        I18n.t('enduser.browser_not_compatible_description'),
      ],
    }),
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
