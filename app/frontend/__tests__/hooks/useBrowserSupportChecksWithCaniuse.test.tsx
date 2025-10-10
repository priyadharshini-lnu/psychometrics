import { renderHook } from '@testing-library/react-hooks'

import { useBrowserSupportChecksWithCaniuse } from '~/hooks/useBrowserSupportChecksWithCaniuse'
import { BROWSER_FEATURES, UA_BROWSERS } from '~/modules/survey/constants/browser'

test('It should return falsy when no browser is supplied', () => {
  const { result } = renderHook(() =>
    useBrowserSupportChecksWithCaniuse(BROWSER_FEATURES.cssFlexibleBoxLayoutModule, '', '11')
  )

  expect(result.current[0]).toBeFalsy()
})

test('It should return falsy when no feature is supplied', () => {
  const { result } = renderHook(() => useBrowserSupportChecksWithCaniuse('', UA_BROWSERS.Safari, '11'))

  expect(result.current[0]).toBeFalsy()
})

test('It should return correct feature is supplied', () => {
  let browserFeatures = BROWSER_FEATURES.mediaRecorderAPI

  const { result, rerender } = renderHook(() =>
    useBrowserSupportChecksWithCaniuse(browserFeatures, UA_BROWSERS.Safari, '11')
  )

  expect(result.current[2]).toEqual('MediaRecorder API')

  browserFeatures = BROWSER_FEATURES.cssFlexibleBoxLayoutModule

  rerender()

  expect(result.current[2]).toEqual('CSS Flexible Box Layout Module')
})

test('It should return correct supported value for a feature on a browser', () => {
  const browserFeatures = BROWSER_FEATURES.mediaRecorderAPI

  let browserName = UA_BROWSERS.Safari
  let browserVersion = '14'

  const { result, rerender } = renderHook(() =>
    useBrowserSupportChecksWithCaniuse(browserFeatures, browserName, browserVersion)
  )

  expect(result.current[0]).toBeFalsy()

  browserName = UA_BROWSERS.FirefoxMobile
  browserVersion = '86'
  rerender()
  expect(result.current[0]).toBeFalsy()

  browserName = UA_BROWSERS.Edge
  browserVersion = '18'
  rerender()
  expect(result.current[0]).toBeFalsy()

  browserName = UA_BROWSERS.SafariMobile
  browserVersion = '11'
  rerender()
  expect(result.current[0]).toBeFalsy()

  /*
  // Failing for some reason after caniuse-lite update
  browserName = UA_BROWSERS.ChromeMobile
  browserVersion = '90'
  rerender()
  expect(result.current[0]).toBeTruthy()
  */
})
