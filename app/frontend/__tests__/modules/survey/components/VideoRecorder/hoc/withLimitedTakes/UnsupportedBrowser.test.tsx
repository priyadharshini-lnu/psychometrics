import {
  getSupportedBrowsersForCurrentOS,
} from 'modules/survey/components/VideoRecorder/hoc/withLimitedTakes/UnsupportedBrowser'
import { NAMES_FROM_UA_BROWSERS, UA_OperatingSystems } from 'modules/survey/constants/browser'

const BrowserSupportForMediaRecorder = {
  and_chr: 90,
  chrome: 49,
  edge: 79,
  firefox: 29,
}

describe('getSupportedBrowsersForCurrentOS function', () => {
  test('Should get only desktop browsers for Desktops', () => {
    // MediaRecorderAPI on Safari Desktop
    const supportedBrowsersForCurrentOS = getSupportedBrowsersForCurrentOS(
      BrowserSupportForMediaRecorder,
      UA_OperatingSystems.MacOS
    )

    expect(supportedBrowsersForCurrentOS.length).toBeGreaterThan(0)

    expect(
      supportedBrowsersForCurrentOS.some((browser) =>
        browser.browserName.includes(NAMES_FROM_UA_BROWSERS.chrome)
      )
    ).toBeTruthy()
    expect(
      supportedBrowsersForCurrentOS.some((browser) =>
        browser.browserName.includes(NAMES_FROM_UA_BROWSERS.and_chr)
      )
    ).toBeFalsy()

    expect(
      supportedBrowsersForCurrentOS.some((browser) =>
        browser.browserName.includes(NAMES_FROM_UA_BROWSERS.firefox)
      )
    ).toBeTruthy()
    expect(
      supportedBrowsersForCurrentOS.some((browser) =>
        browser.browserName.includes(NAMES_FROM_UA_BROWSERS.and_ff)
      )
    ).toBeFalsy()

    expect(
      supportedBrowsersForCurrentOS.some((browser) =>
        browser.browserName.includes(NAMES_FROM_UA_BROWSERS.edge)
      )
    ).toBeTruthy()

    expect(
      supportedBrowsersForCurrentOS.some((browser) =>
        browser.browserName.includes(NAMES_FROM_UA_BROWSERS.safari)
      )
    ).toBeFalsy()
    expect(
      supportedBrowsersForCurrentOS.some((browser) =>
        browser.browserName.includes(NAMES_FROM_UA_BROWSERS.ios_saf)
      )
    ).toBeFalsy()
  })

  test('Should get only mobile browsers for Mobiles', () => {
    const supportedBrowsersForCurrentOS = getSupportedBrowsersForCurrentOS(
      BrowserSupportForMediaRecorder,
      UA_OperatingSystems.IOS
    )

    expect(supportedBrowsersForCurrentOS.length).toBeGreaterThan(0)

    expect(
      supportedBrowsersForCurrentOS.some((browser) =>
        browser.browserName.includes(NAMES_FROM_UA_BROWSERS.chrome)
      )
    ).toBeFalsy()
    expect(
      supportedBrowsersForCurrentOS.some((browser) =>
        browser.browserName.includes(NAMES_FROM_UA_BROWSERS.and_chr)
      )
    ).toBeTruthy()

    expect(
      supportedBrowsersForCurrentOS.some((browser) =>
        browser.browserName.includes(NAMES_FROM_UA_BROWSERS.firefox)
      )
    ).toBeFalsy()
    expect(
      supportedBrowsersForCurrentOS.some((browser) =>
        browser.browserName.includes(NAMES_FROM_UA_BROWSERS.and_ff)
      )
    ).toBeFalsy()

    expect(
      supportedBrowsersForCurrentOS.some((browser) =>
        browser.browserName.includes(NAMES_FROM_UA_BROWSERS.edge)
      )
    ).toBeTruthy()

    expect(
      supportedBrowsersForCurrentOS.some((browser) =>
        browser.browserName.includes(NAMES_FROM_UA_BROWSERS.safari)
      )
    ).toBeFalsy()
    expect(
      supportedBrowsersForCurrentOS.some((browser) =>
        browser.browserName.includes(NAMES_FROM_UA_BROWSERS.ios_saf)
      )
    ).toBeFalsy()
  })

  test('Versions should always be a number', () => {
    const supportedBrowsersForCurrentOS = getSupportedBrowsersForCurrentOS(
      BrowserSupportForMediaRecorder,
      UA_OperatingSystems.MacOS
    )

    expect(
      supportedBrowsersForCurrentOS.every(
        (browser) => browser.browserVersion > 0
      )
    ).toBeTruthy()
  })

  test('Browser links should always be a non empty strings', () => {
    const supportedBrowsersForCurrentOS = getSupportedBrowsersForCurrentOS(
      BrowserSupportForMediaRecorder,
      UA_OperatingSystems.Android
    )

    expect(
      supportedBrowsersForCurrentOS.every(
        (browser) => browser.downloadLink.length !== 0
      )
    ).toBeTruthy()
  })
})

