import { checkBrowserSupportForFeature } from 'utils/uaParser'
import {
  BROWSER_FEATURES,
  MIN_BROWSER_FEATURE_SUPPORT,
} from 'modules/survey/constants/browser'

test('It should return falsy when in test environment', () => {
  const result = checkBrowserSupportForFeature(
    BROWSER_FEATURES.cssFlexibleBoxLayoutModule
  )

  expect(result[0]).toBeFalsy()
})

test('It should return falsy when no feature is supplied', () => {
  const result = checkBrowserSupportForFeature('')

  expect(result[0]).toBeFalsy()
})

test('It should return correct support for media recorder api for browsers', () => {
  const browserFeature = BROWSER_FEATURES.mediaRecorderAPI

  // mobile safari 10
  expect(
    checkBrowserSupportForFeature(
      browserFeature,
      'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1'
    ).isBrowserSupported
  ).toBeFalsy()

  // mobile samsung 4
  expect(
    checkBrowserSupportForFeature(
      browserFeature,
      'Mozilla/5.0 (Linux; U; Android 4.4.2; en-us; SCH-I535 Build/KOT49H) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30'
    ).isBrowserSupported
  ).toBeFalsy()

  // mobile chrome 59
  expect(
    checkBrowserSupportForFeature(
      browserFeature,
      'Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36'
    ).isBrowserSupported
  ).toBeFalsy()

  // mobile firefox 54
  expect(
    checkBrowserSupportForFeature(
      browserFeature,
      'Mozilla/5.0 (Android 7.0; Mobile; rv:54.0) Gecko/54.0 Firefox/54.0'
    ).isBrowserSupported
  ).toBeFalsy()

  // mobile firefox 7.5
  expect(
    checkBrowserSupportForFeature(
      browserFeature,
      'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_2 like Mac OS X) AppleWebKit/603.2.4 (KHTML, like Gecko) FxiOS/7.5b3349 Mobile/14F89 Safari/603.2.4'
    ).isBrowserSupported
  ).toBeFalsy()

  // yandex
  expect(
    checkBrowserSupportForFeature(
      browserFeature,
      'Mozilla/5.0 (Linux; Android 6.0; Lenovo K50a40 Build/MRA58K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.137 YaBrowser/17.4.1.352.00 Mobile Safari/537.36'
    ).isBrowserSupported
  ).toBeFalsy()

  // MIUI browser
  expect(
    checkBrowserSupportForFeature(
      browserFeature,
      'Mozilla/5.0 (Linux; U; Android 7.0; en-us; MI 5 Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.146 Mobile Safari/537.36 XiaoMi/MiuiBrowser/9.0.3'
    ).isBrowserSupported
  ).toBeFalsy()

  // mobile edge
  expect(
    checkBrowserSupportForFeature(
      browserFeature,
      'Mozilla/5.0 (Windows Phone 10.0; Android 6.0.1; Microsoft; Lumia 950) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Mobile Safari/537.36 Edge/15.14977'
    ).isBrowserSupported
  ).toBeFalsy()

  // dolphin
  expect(
    checkBrowserSupportForFeature(
      browserFeature,
      'Mozilla/5.0 (Linux; Android 6.0.1; SM-G920V Build/MMB29K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.98 Mobile Safari/537.36'
    ).isBrowserSupported
  ).toBeFalsy()

  // mobile edge 12.2
  expect(
    checkBrowserSupportForFeature(
      browserFeature,
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246'
    ).isBrowserSupported
  ).toBeFalsy()

  // mobile chrome 97
  expect(
    checkBrowserSupportForFeature(
      browserFeature,
      'Mozilla/5.0 (Linux; Android 10; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4681.0 Mobile Safari/537.36'
    ).isBrowserSupported
  ).toBeTruthy()

  // firfox 70
  expect(
    checkBrowserSupportForFeature(
      browserFeature,
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:70.0) Gecko/20100101 Firefox/70.0'
    ).isBrowserSupported
  ).toBeTruthy()

  // ie 11
  expect(
    checkBrowserSupportForFeature(
      browserFeature,
      'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko'
    ).isBrowserSupported
  ).toBeFalsy()
})

test("It should return correct browser supported list for flexbox api's", () => {
  // edge 12.2
  expect(
    checkBrowserSupportForFeature(
      BROWSER_FEATURES.cssFlexibleBoxLayoutModule,
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246'
    ).supportedBrowsers
  ).toEqual(
    MIN_BROWSER_FEATURE_SUPPORT[BROWSER_FEATURES.cssFlexibleBoxLayoutModule]
  )
})
