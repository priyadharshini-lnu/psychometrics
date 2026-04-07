
import { BROWSER_NAME, BROWSER_VERSION } from '~/utils/uaParser'

const { I18n } = window


export const MIN_BROWSER_VERSIONS = {
  Chrome: 144,
  Firefox: 148,
  Safari: 26,
  Edge: 145,
}

export const browserCheckErrorMessage = {
  browserVersion: {
    ...(MIN_BROWSER_VERSIONS[BROWSER_NAME] ? {
      title: I18n.t('enduser.browser_version_fix_title', {
        browser_name: BROWSER_NAME,
        browser_version: BROWSER_VERSION,
        updated_version: MIN_BROWSER_VERSIONS[BROWSER_NAME],
      }),
      description: [
        I18n.t('enduser.browser_version_fix_description_first', {
          browser_name: BROWSER_NAME,
          updated_version: MIN_BROWSER_VERSIONS[BROWSER_NAME],
        }),
      ],
    } : {
      title: `Your browser ${BROWSER_NAME} is not compatible with this campaign. `,
      description: [
        'Use the latest versions of Chrome, Firefox, Safari or Edge for the best experience.',
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
