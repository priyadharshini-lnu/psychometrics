export const UA_Browsers = {
  Safari: 'safari',
  SafariMobile: 'ios_saf',
  Chrome: 'chrome',
  ChromeMobile: 'and_chr',
  Firefox: 'firefox',
  FirefoxMobile: 'and_ff',
  Edge: 'edge',
  Samsung: 'samsung',
  Opera: 'opera',
}

export const UA_OperatingSystems = {
  Android: 'Android',
  IOS: 'iOS',
  MacOS: 'Mac OS',
  Windows: 'Windows',
  Linux: 'Linux',
}

export const BROWSERS_ON_OS_TYPES = {
  [UA_OperatingSystems.Android]: [
    UA_Browsers.FirefoxMobile,
    UA_Browsers.ChromeMobile,
    UA_Browsers.Edge,
  ],
  [UA_OperatingSystems.IOS]: [
    UA_Browsers.FirefoxMobile,
    UA_Browsers.ChromeMobile,
    UA_Browsers.SafariMobile,
    UA_Browsers.Edge,
  ],
  [UA_OperatingSystems.MacOS]: [
    UA_Browsers.Firefox,
    UA_Browsers.Chrome,
    UA_Browsers.Safari,
    UA_Browsers.Edge,
  ],
  [UA_OperatingSystems.Windows]: [
    UA_Browsers.Firefox,
    UA_Browsers.Chrome,
    UA_Browsers.Edge,
  ],
  [UA_OperatingSystems.Linux]: [
    UA_Browsers.Firefox,
    UA_Browsers.Chrome,
    UA_Browsers.Edge,
  ],
}

export const BROWSER_DOWNLOAD_LINKS = {
  [UA_Browsers.Safari]: 'https://www.apple.com/safari/',
  [UA_Browsers.SafariMobile]: 'https://www.apple.com/safari/',
  [UA_Browsers.Firefox]: 'https://www.mozilla.org/en-US/firefox/mobile/',
  [UA_Browsers.FirefoxMobile]: 'https://www.mozilla.org/en-US/firefox/',
  [UA_Browsers.Chrome]: 'https://www.google.com/chrome/',
  [UA_Browsers.ChromeMobile]: 'https://www.google.com/chrome/',
  [UA_Browsers.Edge]: 'https://www.microsoft.com/en-us/edge',
}

export const NAMES_FROM_UA_BROWSERS = {
  [UA_Browsers.Safari]: 'Apple Safari',
  [UA_Browsers.SafariMobile]: 'Mobile Safari',
  [UA_Browsers.Firefox]: 'Mozilla Firefox',
  [UA_Browsers.FirefoxMobile]: 'Mobile Firefox',
  [UA_Browsers.Chrome]: 'Google Chrome',
  [UA_Browsers.ChromeMobile]: 'Mobile Chrome',
  [UA_Browsers.Edge]: 'Microsoft Edge',
}

export const BROWSER_FEATURES = {
  mediaRecorderAPI: 'mediarecorder',
  cssFlexibleBoxLayoutModule: 'flexbox',
  pushAPI: 'push-api',
}

// Based on feature summary of entire api support in browsers
export const MIN_BROWSER_FEATURE_SUPPORT = {
  [BROWSER_FEATURES.mediaRecorderAPI]: {
    [UA_Browsers.Edge]: 79,
    [UA_Browsers.Firefox]: 29,
    [UA_Browsers.FirefoxMobile]: null,
    [UA_Browsers.Chrome]: 49,
    [UA_Browsers.ChromeMobile]: 94,
    [UA_Browsers.Safari]: 14.1,
    [UA_Browsers.SafariMobile]: 14.8,
    [UA_Browsers.Samsung]: 5,
    [UA_Browsers.Opera]: 36,
  },
  [BROWSER_FEATURES.cssFlexibleBoxLayoutModule]: {
    [UA_Browsers.Edge]: 84,
    [UA_Browsers.Firefox]: 63,
    [UA_Browsers.FirefoxMobile]: 92,
    [UA_Browsers.Chrome]: 84,
    [UA_Browsers.ChromeMobile]: 94,
    [UA_Browsers.Safari]: 14.1,
    [UA_Browsers.SafariMobile]: 14.8,
    [UA_Browsers.Samsung]: 14,
    [UA_Browsers.Opera]: 73,
  },
}
