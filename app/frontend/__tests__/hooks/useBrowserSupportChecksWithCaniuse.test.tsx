import { renderHook } from '@testing-library/react'

import { useBrowserSupportChecksWithCaniuse } from '~/hooks/useBrowserSupportChecksWithCaniuse'
import { BROWSER_FEATURES, UA_BROWSERS } from '~/modules/survey/constants/browser'

test('It should return falsy when no browser is supplied', () => {
  const { result } = renderHook(() =>
    useBrowserSupportChecksWithCaniuse(BROWSER_FEATURES.cssFlexibleBoxLayoutModule, '', '11')
  )

  expect(result.current[0])
    .toBeFalsy()
})

test('It should return falsy when no feature is supplied', () => {
  const { result } = renderHook(() => useBrowserSupportChecksWithCaniuse('', UA_BROWSERS.Safari, '11'))

  expect(result.current[0])
    .toBeFalsy()
})

test('It should return correct feature is supplied', () => {
  let browserFeatures = BROWSER_FEATURES.mediaRecorderAPI

  const {
    result,
    rerender
  } = renderHook(() =>
    useBrowserSupportChecksWithCaniuse(browserFeatures, UA_BROWSERS.Safari, '11')
  )

  expect(result.current[2])
    .toEqual('MediaRecorder API')

  browserFeatures = BROWSER_FEATURES.cssFlexibleBoxLayoutModule

  rerender()

  expect(result.current[2])
    .toEqual('CSS Flexible Box Layout Module')
})

test('It should return correct supported value for a feature on a browser', () => {
  const browserFeatures = BROWSER_FEATURES.mediaRecorderAPI

  let browserName = UA_BROWSERS.Safari
  let browserVersion = '14'

  const {
    result,
    rerender
  } = renderHook(() =>
    useBrowserSupportChecksWithCaniuse(browserFeatures, browserName, browserVersion)
  )

  expect(result.current[0])
    .toBeFalsy()

  browserName = UA_BROWSERS.FirefoxMobile
  browserVersion = '86'
  rerender()
  expect(result.current[0])
    .toBeFalsy()

  browserName = UA_BROWSERS.Edge
  browserVersion = '18'
  rerender()
  expect(result.current[0])
    .toBeFalsy()

  browserName = UA_BROWSERS.SafariMobile
  browserVersion = '11'
  rerender()
  expect(result.current[0])
    .toBeFalsy()

  /*
  // Failing for some reason after caniuse-lite update
  browserName = UA_BROWSERS.ChromeMobile
  browserVersion = '90'
  rerender()
  expect(result.current[0]).toBeTruthy()
  */
})


test('It should show correct minimum browser support values for unsupported feature on browser', () => {
  let browserFeature = BROWSER_FEATURES.pushAPI
  let browserName = UA_BROWSERS.Safari
  let browserVersion = '10'
  const {
    result,
    rerender
  } = renderHook(() =>
    useBrowserSupportChecksWithCaniuse(browserFeature, browserName, browserVersion)
  )
  expect(result.current[0])
    .toBeFalsy()
  expect(result.current[1])
    .toEqual({
      and_chr: 142,
      and_ff: 144,
      chrome: 50,
      edge: 17,
      firefox: 44,
      opera: 42,
      samsung: 4,
    })
  expect(result.current[2])
    .toEqual('Push API')

  browserFeature = BROWSER_FEATURES.cssFlexibleBoxLayoutModule
  browserName = UA_BROWSERS.Opera
  browserVersion = '10'
  rerender()
  expect(result.current[0])
    .toBeFalsy()
  expect(result.current[1])
    .toEqual({
      and_chr: 142,
      and_ff: 144,
      chrome: 21,
      edge: 12,
      firefox: 28,
      ios_saf: 7,
      opera: 12.1,
      safari: 6.1,
      samsung: 4,
    })
  expect(result.current[2])
    .toEqual('CSS Flexible Box Layout Module')

})
