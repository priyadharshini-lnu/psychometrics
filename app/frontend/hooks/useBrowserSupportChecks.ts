import { useMemo } from 'react'
import { feature, features, StatsByAgentID } from 'caniuse-lite'
import browserslist from 'browserslist'
import { browserName, browserVersion, isMobile } from 'react-device-detect'
import isEmpty from 'lodash/isEmpty'

import { BROWSER_FEATURES, UA_Browsers } from 'modules/survey/constants/browser'
import { convertToUserAgentBrowserName } from 'modules/survey/utils/browser'

export const useBrowserSupportChecks = (
  featureName: string,
  uaBrowserName = '',
  browserAbsoluteVersion = '',
) => {
  const browser = uaBrowserName.length === 0
    ? convertToUserAgentBrowserName(browserName, isMobile)
    : uaBrowserName
  const version = browserAbsoluteVersion.length === 0
    ? browserVersion
    : browserAbsoluteVersion

  if (browser.length === 0 || version.length === 0) {
    console.error('Browser or its version are empty')
    return [false, {}, ''] as const
  }

  if (
    featureName.length === 0
    || !Object.values(BROWSER_FEATURES).includes(featureName)
  ) {
    console.error('Feature name is empty')
    return [false, {}, ''] as const
  }

  const { title, stats: featureStatistics } = useMemo(
    () => feature(features[featureName]),
    [featureName],
  )

  if (title.length === 0 || isEmpty(featureStatistics)) {
    console.error('Feature name is invalid')
    return [false, {}, ''] as const
  }

  const filterUncompatBrowserStatistics = (
    featureStatistics: StatsByAgentID,
  ) => {
    const allBrowsersName = Object.keys(featureStatistics)
    const allAllowedBrowserNames = Object.values(UA_Browsers)

    let allowedStats: StatsByAgentID = {}

    allBrowsersName.forEach((name) => {
      if (featureStatistics[name] && allAllowedBrowserNames.includes(name)) {
        allowedStats = {
          ...allowedStats,
          [name]: featureStatistics[name],
        }
      }
    })
    return allowedStats
  }

  const getSupportedBrowsers = (compatBrowserStatistics: StatsByAgentID) => {
    const supportedBrowsers: Record<string, number> = {}

    const compatBrowserNames = Object.keys(compatBrowserStatistics)
    compatBrowserNames.forEach((compatBrowserName) => {
      let minVersion = 0

      const compatBrowserVersions = Object.keys(
        compatBrowserStatistics[compatBrowserName],
      )
      compatBrowserVersions.forEach((compatBrowserVersion) => {
        const versionSupport = compatBrowserStatistics[compatBrowserName][compatBrowserVersion]
        if (versionSupport === 'y' || versionSupport.includes('y')) {
          let supportedVersion = 0

          if (compatBrowserVersion.includes('-')) {
            supportedVersion = parseFloat(compatBrowserVersion.split('-')[0])
          } else if (!isNaN(parseInt(compatBrowserVersion, 10))) {
            supportedVersion = parseFloat(compatBrowserVersion)
          }

          if (
            (supportedVersion !== 0 && minVersion === 0)
            || supportedVersion < minVersion
          ) {
            minVersion = supportedVersion
          }
        }
      })

      if (minVersion !== 0) {
        supportedBrowsers[compatBrowserName] = minVersion
      }
    })

    return supportedBrowsers
  }

  // Get browserlist compatible browser name and version
  const [browserNameVersion] = useMemo(
    () => browserslist(`${browser} ${version}`),
    [browser, version],
  )

  const [
    browserslistBrowserName,
    browserslistBrowserVersion,
  ] = browserNameVersion.split(' ')

  // Query caniuse to check if browser and its version are supported
  const queryTag = featureStatistics?.[browserslistBrowserName]?.[
      browserslistBrowserVersion
    ] ?? ''
  const isSupported = queryTag === 'y'

  // From all world browsers filter out only our app's compatible ones
  const compatBrowserStatistics = filterUncompatBrowserStatistics(
    featureStatistics,
  )

  // From list of app's compatible browsers, filter out the ones which supports "The Feature"
  const supportedBrowsers = useMemo(
    () => getSupportedBrowsers(compatBrowserStatistics),
    [featureName],
  )

  return [isSupported, supportedBrowsers, title] as const
}
