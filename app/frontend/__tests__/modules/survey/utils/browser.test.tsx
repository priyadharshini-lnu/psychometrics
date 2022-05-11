import { convertToUserAgentBrowserName } from 'modules/survey/utils/browser'
import { UA_BROWSERS } from 'modules/survey/constants/browser'

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
  expect(uaBrowserName).toEqual(UA_BROWSERS.Firefox)

  uaBrowserName = convertToUserAgentBrowserName('Chrome', false)
  expect(uaBrowserName).toEqual(UA_BROWSERS.Chrome)

  uaBrowserName = convertToUserAgentBrowserName('Safari', false)
  expect(uaBrowserName).toEqual(UA_BROWSERS.Safari)

  uaBrowserName = convertToUserAgentBrowserName('Edge', false)
  expect(uaBrowserName).toEqual(UA_BROWSERS.Edge)
})

test('Should return correct UA browser name for mobile/tab', () => {
  let uaBrowserName = convertToUserAgentBrowserName('Firefox', true)
  expect(uaBrowserName).toEqual(UA_BROWSERS.FirefoxMobile)

  uaBrowserName = convertToUserAgentBrowserName('Chrome', true)
  expect(uaBrowserName).toEqual(UA_BROWSERS.ChromeMobile)

  uaBrowserName = convertToUserAgentBrowserName('Safari', true)
  expect(uaBrowserName).toEqual(UA_BROWSERS.SafariMobile)

  uaBrowserName = convertToUserAgentBrowserName('Mobile Safari', true)
  expect(uaBrowserName).toEqual(UA_BROWSERS.SafariMobile)

  uaBrowserName = convertToUserAgentBrowserName('Edge', true)
  expect(uaBrowserName).toEqual(UA_BROWSERS.Edge)
})
