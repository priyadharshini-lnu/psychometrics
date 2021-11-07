import { UA_Browsers } from 'modules/survey/constants/browser'

export const convertToUserAgentBrowserName = (
  browserName: string,
  isMobile: boolean,
) => {
  if (browserName === 'Mobile Safari') {
    return UA_Browsers.SafariMobile
  }
  if (browserName === 'Safari') {
    return isMobile ? UA_Browsers.SafariMobile : UA_Browsers.Safari
  }
  if (browserName === 'Chrome') {
    return isMobile ? UA_Browsers.ChromeMobile : UA_Browsers.Chrome
  }
  if (browserName === 'Firefox') {
    return isMobile ? UA_Browsers.FirefoxMobile : UA_Browsers.Firefox
  }
  if (browserName === 'Edge') {
    return UA_Browsers.Edge
  }
  if (browserName === 'Android Browser' || browserName === 'Samsung Browser') {
    return UA_Browsers.Samsung
  }
  if (browserName === 'Opera') {
    return UA_Browsers.Opera
  }
  return ''
}
