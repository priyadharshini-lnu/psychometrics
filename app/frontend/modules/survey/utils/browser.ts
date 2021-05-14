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
  if (browserName === 'Android Browser') {
    return 'android'
  }
  if (browserName === 'Opera') {
    return 'opera'
  }
  if (browserName === 'Opera Mobi' || browserName === 'Opera Mobile') {
    return 'op_mob'
  }
  if (browserName === 'Opera Mini') {
    return 'op_mini'
  }
  return ''
}
