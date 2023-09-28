export const UA_BROWSERS = {
  Safari: 'safari',
  SafariMobile: 'ios_saf',
  Chrome: 'chrome',
  ChromeMobile: 'and_chr',
  Firefox: 'firefox',
  FirefoxMobile: 'and_ff',
  Edge: 'edge',
  Samsung: 'samsung',
  Opera: 'opera',
  ExamusElectron: 'examus-electron',
}

export const UA_OPERATING_SYSTEMS = {
  Android: 'Android',
  IOS: 'iOS',
  MacOS: 'Mac OS',
  Windows: 'Windows',
  Linux: 'Linux',
}

export const BROWSERS_ON_OS_TYPES = {
  [UA_OPERATING_SYSTEMS.Android]: [
    UA_BROWSERS.FirefoxMobile,
    UA_BROWSERS.ChromeMobile,
    UA_BROWSERS.Edge,
    UA_BROWSERS.ExamusElectron,
  ],
  [UA_OPERATING_SYSTEMS.IOS]: [
    UA_BROWSERS.FirefoxMobile,
    UA_BROWSERS.ChromeMobile,
    UA_BROWSERS.SafariMobile,
    UA_BROWSERS.Edge,
    UA_BROWSERS.ExamusElectron,
  ],
  [UA_OPERATING_SYSTEMS.MacOS]: [
    UA_BROWSERS.Firefox,
    UA_BROWSERS.Chrome,
    UA_BROWSERS.Safari,
    UA_BROWSERS.Edge,
    UA_BROWSERS.ExamusElectron,
  ],
  [UA_OPERATING_SYSTEMS.Windows]: [
    UA_BROWSERS.Firefox,
    UA_BROWSERS.Chrome,
    UA_BROWSERS.Edge,
    UA_BROWSERS.ExamusElectron,
  ],
  [UA_OPERATING_SYSTEMS.Linux]: [
    UA_BROWSERS.Firefox,
    UA_BROWSERS.Chrome,
    UA_BROWSERS.Edge,
    UA_BROWSERS.ExamusElectron,
  ],
}

export const BROWSER_DOWNLOAD_LINKS = {
  [UA_BROWSERS.Safari]: 'https://www.apple.com/safari/',
  [UA_BROWSERS.SafariMobile]: 'https://www.apple.com/safari/',
  [UA_BROWSERS.Firefox]: 'https://www.mozilla.org/en-US/firefox/mobile/',
  [UA_BROWSERS.FirefoxMobile]: 'https://www.mozilla.org/en-US/firefox/',
  [UA_BROWSERS.Chrome]: 'https://www.google.com/chrome/',
  [UA_BROWSERS.ChromeMobile]: 'https://www.google.com/chrome/',
  [UA_BROWSERS.Edge]: 'https://www.microsoft.com/en-us/edge',
}

export const NAMES_FROM_UA_BROWSERS = {
  [UA_BROWSERS.Safari]: 'Apple Safari',
  [UA_BROWSERS.SafariMobile]: 'Mobile Safari',
  [UA_BROWSERS.Firefox]: 'Mozilla Firefox',
  [UA_BROWSERS.FirefoxMobile]: 'Mobile Firefox',
  [UA_BROWSERS.Chrome]: 'Google Chrome',
  [UA_BROWSERS.ChromeMobile]: 'Mobile Chrome',
  [UA_BROWSERS.Edge]: 'Microsoft Edge',
  [UA_BROWSERS.ExamusElectron]: 'Examus Electron',
}

export const BROWSER_FEATURES = {
  mediaRecorderAPI: 'mediarecorder',
  cssFlexibleBoxLayoutModule: 'flexbox',
  pushAPI: 'push-api',
}

// Based on feature summary of entire api support in browsers
export const MIN_BROWSER_FEATURE_SUPPORT = {
  [BROWSER_FEATURES.mediaRecorderAPI]: {
    [UA_BROWSERS.Edge]: 79,
    [UA_BROWSERS.Firefox]: 29,
    [UA_BROWSERS.FirefoxMobile]: 110,
    [UA_BROWSERS.Chrome]: 49,
    [UA_BROWSERS.ChromeMobile]: 94,
    [UA_BROWSERS.Safari]: 14.1,
    [UA_BROWSERS.SafariMobile]: 14.8,
    [UA_BROWSERS.Samsung]: 5,
    [UA_BROWSERS.Opera]: 36,
    [UA_BROWSERS.ExamusElectron]: 1.0,
  },
  [BROWSER_FEATURES.cssFlexibleBoxLayoutModule]: {
    [UA_BROWSERS.Edge]: 84,
    [UA_BROWSERS.Firefox]: 63,
    [UA_BROWSERS.FirefoxMobile]: 92,
    [UA_BROWSERS.Chrome]: 84,
    [UA_BROWSERS.ChromeMobile]: 94,
    [UA_BROWSERS.Safari]: 14.1,
    [UA_BROWSERS.SafariMobile]: 14.8,
    [UA_BROWSERS.Samsung]: 14,
    [UA_BROWSERS.Opera]: 73,
  },
}
