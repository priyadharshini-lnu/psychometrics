import { UAParser } from 'ua-parser-js'

import {
  BROWSER_FEATURES,
  UA_BROWSERS,
  MIN_BROWSER_FEATURE_SUPPORT,
} from '~/modules/survey/constants/browser'
import { convertToUserAgentBrowserName } from '~/modules/survey/utils/browser'

const myOwnListOfBrowsers = [
  [/(examus-electron)\/([\w.]+)/i], [UAParser.BROWSER.NAME, UAParser.BROWSER.VERSION],
]

const uaParser = new UAParser({ browser: myOwnListOfBrowsers })

export const BROWSER_NAME = uaParser.getBrowser().name ?? ''
export const BROWSER_VERSION = uaParser.getBrowser().version ?? ''

const DEVICE_TYPE = uaParser.getDevice().type ?? ''
export const IS_MOBILE = DEVICE_TYPE === 'mobile' || DEVICE_TYPE === 'tablet'

export const OS_NAME = uaParser.getOS().name ?? ''
export const OS_VERSION = uaParser.getOS().version ?? ''

export const UA_STRING = uaParser.getUA() ?? ''

export const checkBrowserSupportForFeature = (
  featureName: string,
  uaString?: string,
): {
  isBrowserSupported: boolean
  supportedBrowsers: Record<string, number>
} => {
  if (uaString && uaString.length > 0) {
    uaParser.setUA(uaString)
  }

  const browserName = uaParser.getBrowser().name ?? ''

  const type = uaParser.getDevice().type ?? ''
  const isMobile = type === 'mobile' || type === 'tablet'

  const browser = convertToUserAgentBrowserName(browserName, isMobile)

  const browserVersion = uaParser.getBrowser().version ?? ''

  // Take major and minor versions only
  const browserVersionSplit = browserVersion.split('.')
  const version = `${parseInt(browserVersionSplit[0], 10)}.${parseInt(
    browserVersionSplit[1] || '0',
    10,
  )}`

  // console.table({
  //   actualBrowser: browserName,
  //   parsedBrowser: browser,
  //   actualVersion: browserVersion,
  //   parsedVersion: version,
  // })

  if (
    browser.length === 0
    || !Object.values(UA_BROWSERS).includes(browser)
    || version.length === 0
    || featureName.length === 0
    || !Object.values(BROWSER_FEATURES).includes(featureName)
  ) {
    return {
      isBrowserSupported: false,
      supportedBrowsers: {},
    }
  }

  const minSupportedVersion = MIN_BROWSER_FEATURE_SUPPORT?.[featureName]?.[browser]

  if (
    minSupportedVersion === null
    || parseFloat(version) < minSupportedVersion
  ) {
    const supportedBrowsers = getSupportedBrowsersFromList(
      MIN_BROWSER_FEATURE_SUPPORT[featureName],
    )
    return { isBrowserSupported: false, supportedBrowsers }
  }

  return { isBrowserSupported: true, supportedBrowsers: {} }
}

const getSupportedBrowsersFromList = (
  browserFeatureMap: Record<string, number | null>,
) => {
  const supportedBrowsers = Object.keys(browserFeatureMap)
    .filter(browser => browserFeatureMap[browser] !== null)
    .reduce(
      (currentBrowser, browserKey) => Object.assign(currentBrowser, {
        [browserKey]: browserFeatureMap[browserKey],
      }),
      {} as Record<string, number>,
    )

  return supportedBrowsers
}
