import os from 'node:os'

import chalk from 'chalk'
import {expect, TestInfo} from '@playwright/test'

import {illegalRe} from '@e2e-support/util'
import testConfig from '@e2e-test.config'
import {ScreenshotOptions, TestArgs} from '@e2e-types'


export async function matchSnapshot(testInfo: TestInfo, testArgs: TestArgs, options: ScreenshotOptions = {}) {
  if (os.platform() !== 'linux') {
    // eslint-disable-next-line no-console
    console.log(
      chalk.yellow(
        '^ Warning: No visual test performed. Run in Linux or Playwright docker image to match snapshot.',
      ),
    )
    return
  }

  if (testConfig.snapshotEnabled) {
    // Visual test with built-in snapshot
    const filename = testInfo.title.replace(illegalRe, '').replace(/\s/g, '-').trim().toLowerCase()
    await expect(testArgs.page).toHaveScreenshot(`${filename}.png`, {fullPage: true, ...options})
  }
}
