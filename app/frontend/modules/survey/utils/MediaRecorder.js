import { BROWSER_NAME, IS_MOBILE } from '~/utils/uaParser'
import { convertToUserAgentBrowserName } from '~/modules/survey/utils/browser'
import { UA_BROWSERS } from '~/modules/survey/constants/browser'

let patched = false

export function patchMediaRecorder () {
  if (patched) return
  const browser = convertToUserAgentBrowserName(BROWSER_NAME, IS_MOBILE)
  if (browser === UA_BROWSERS.Safari || browser === UA_BROWSERS.SafariMobile) {
    patched = true
    const DefaultMediaRecorder = window.MediaRecorder
    const kb = 8 * 1024
    const preferredBitRatePerSecond = 100 * kb
    window.MediaRecorder = class extends DefaultMediaRecorder {
      constructor (stream, options) {
        super(stream, {
          ...options,
          audioBitsPerSecond: preferredBitRatePerSecond,
          videoBitsPerSecond: preferredBitRatePerSecond,
        })
      }
    }
  }
}

patchMediaRecorder()
