import { renderHook } from '@testing-library/react-hooks'

import { useBrowserSupportChecks } from 'hooks/useBrowserSupportChecks'
import { BROWSER_FEATURES } from 'modules/survey/constants/browser'

test('It should return falsy when no browser is supplied', () => {
  const { result } = renderHook(() =>
    useBrowserSupportChecks(BROWSER_FEATURES.cssFlexibleBoxLayoutModule, '', '11')
  )

  expect(result.current[0]).toBeFalsy()
})

test('It should return falsy when no feature is supplied', () => {
  const { result } = renderHook(() => useBrowserSupportChecks('', 'safari', '11'))

  expect(result.current[0]).toBeFalsy()
})

test('It should return correct feature is supplied', () => {
  let browserFeatures = BROWSER_FEATURES.mediaRecorderAPI

  const { result, rerender } = renderHook(() =>
    useBrowserSupportChecks(browserFeatures, 'safari', '11')
  )

  expect(result.current[2]).toEqual('MediaRecorder API')

  browserFeatures = BROWSER_FEATURES.cssFlexibleBoxLayoutModule

  rerender()

  expect(result.current[2]).toEqual('CSS Flexible Box Layout Module')
})

test('It should return correct supported value for a feature on a browser', () => {
  const browserFeatures = BROWSER_FEATURES.mediaRecorderAPI

  let browserName = 'safari'
  let browserVersion = '14'

  const { result, rerender } = renderHook(() =>
    useBrowserSupportChecks(browserFeatures, browserName, browserVersion)
  )

  expect(result.current[0]).toBeFalsy()

  browserName = 'and_ff'
  browserVersion = '86'
  rerender()
  expect(result.current[0]).toBeFalsy()

  browserName = 'edge'
  browserVersion = '18'
  rerender()
  expect(result.current[0]).toBeFalsy()

  browserName = 'ios_saf'
  browserVersion = '11'
  rerender()
  expect(result.current[0]).toBeFalsy()

  browserName = 'and_chr'
  browserVersion = '90'
  rerender()
  expect(result.current[0]).toBeTruthy()
})

test('It should show correct minimum browser support values for unsupported feature on browser', () => {
  const { result } = renderHook(() =>
    useBrowserSupportChecks(BROWSER_FEATURES.pushAPI, 'safari', '10')
  )

  expect(result.current[0]).toBeFalsy()
  expect(result.current[1]).toEqual({
    and_chr: 90,
    and_ff: 87,
    chrome: 50,
    edge: 17,
    firefox: 44,
  })
  expect(result.current[2]).toEqual('Push API')
})
