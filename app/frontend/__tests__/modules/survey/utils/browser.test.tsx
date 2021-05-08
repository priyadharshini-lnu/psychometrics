import { convertToUserAgentBrowserName } from 'modules/survey/utils/browser'
import { UA_Browsers } from 'modules/survey/constants/browser'

test('Should return empty for unknown browser', () => {
  let uaBrowserName = convertToUserAgentBrowserName('QC browser', false)
  expect(uaBrowserName).toEqual('')

  uaBrowserName = convertToUserAgentBrowserName('Yandex', true)
  expect(uaBrowserName).toEqual('')

  uaBrowserName = convertToUserAgentBrowserName('Unknown', false)
  expect(uaBrowserName).toEqual('')
})

test('Should return correct UA browser name for desktop', () => {
  let uaBrowserName = convertToUserAgentBrowserName('Firefox', false)
  expect(uaBrowserName).toEqual(UA_Browsers.Firefox)

  uaBrowserName = convertToUserAgentBrowserName('Chrome', false)
  expect(uaBrowserName).toEqual(UA_Browsers.Chrome)

  uaBrowserName = convertToUserAgentBrowserName('Safari', false)
  expect(uaBrowserName).toEqual(UA_Browsers.Safari)

  uaBrowserName = convertToUserAgentBrowserName('Edge', false)
  expect(uaBrowserName).toEqual(UA_Browsers.Edge)
})

test('Should return correct UA browser name for mobile/tab', () => {
  let uaBrowserName = convertToUserAgentBrowserName('Firefox', true)
  expect(uaBrowserName).toEqual(UA_Browsers.FirefoxMobile)

  uaBrowserName = convertToUserAgentBrowserName('Chrome', true)
  expect(uaBrowserName).toEqual(UA_Browsers.ChromeMobile)

  uaBrowserName = convertToUserAgentBrowserName('Safari', true)
  expect(uaBrowserName).toEqual(UA_Browsers.SafariMobile)

  uaBrowserName = convertToUserAgentBrowserName('Mobile Safari', true)
  expect(uaBrowserName).toEqual(UA_Browsers.SafariMobile)

  uaBrowserName = convertToUserAgentBrowserName('Edge', true)
  expect(uaBrowserName).toEqual(UA_Browsers.Edge)
})
