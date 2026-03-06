import { UA_BROWSERS } from '~/modules/survey/constants/browser'

export const convertToUserAgentBrowserName = (
  browserName: string,
  isMobile: boolean,
) => {
  if (browserName === 'Mobile Safari') {
    return UA_BROWSERS.SafariMobile
  }
  if (browserName === 'Safari') {
    return isMobile ? UA_BROWSERS.SafariMobile : UA_BROWSERS.Safari
  }
  if (browserName === 'Chrome' || browserName === 'Mobile Chrome') {
    return isMobile ? UA_BROWSERS.ChromeMobile : UA_BROWSERS.Chrome
  }
  if (browserName === 'Firefox' || browserName === 'Mobile Firefox') {
    return isMobile ? UA_BROWSERS.FirefoxMobile : UA_BROWSERS.Firefox
  }
  if (browserName === 'Edge') {
    return UA_BROWSERS.Edge
  }
  if (browserName === 'Android Browser' || browserName === 'Samsung Browser') {
    return UA_BROWSERS.Samsung
  }
  if (browserName === 'Opera') {
    return UA_BROWSERS.Opera
  }
  if (browserName === 'examus-electron') {
    return UA_BROWSERS.ExamusElectron
  }
  return ''
}
