import { FC } from 'react'
import {
  Button, Card, Result, Space, Typography,
} from 'antd'
import { OS_NAME } from '~/utils/uaParser'

import chromeIcon from '~/modules/survey/assets/icons/chrome.r.svg'
import firefoxIcon from '~/modules/survey/assets/icons/firefox.r.svg'
import edgeIcon from '~/modules/survey/assets/icons/edge.r.svg'
import safariIcon from '~/modules/survey/assets/icons/safari.r.svg'

import {
  BROWSERS_ON_OS_TYPES,
  BROWSER_DOWNLOAD_LINKS,
  NAMES_FROM_UA_BROWSERS,
} from '~/modules/survey/constants/browser'
import styles from './styles.less'

const { I18n } = window

interface Props {
  supportedBrowsers: Record<string, number>
  os?: string
}

export const UnsupportedBrowser: FC<Props> = ({
  supportedBrowsers,
  os = '',
}) => {
  const operatingSystem = os.length === 0 ? OS_NAME : os

  const supportedBrowsersForCurrentOS = getSupportedBrowsersForCurrentOS(
    supportedBrowsers,
    operatingSystem,
  )

  return (
    <Card>
      <Result
        status="warning"
        subTitle={
          supportedBrowsersForCurrentOS.length === 0
            ? I18n.t('assessments.video_response.media_recorder.failure')
            : I18n.t('assessments.video_response.media_recorder.unsupported')
        }
        extra={(
          <Space wrap className="ta-c flex justify-center">
            {supportedBrowsersForCurrentOS.map(
              ({
                browserName, browserVersion, downloadLink, browserIcon,
              }) => (
                <Button
                  type="link"
                  href={downloadLink}
                  key={browserName}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {browserIcon}
                  <div>
                    <Typography.Text>
                      {browserName}
                      {' '}
                      {browserVersion}
                      +
                    </Typography.Text>
                  </div>
                </Button>
              ),
            )}
          </Space>
        )}
      />
    </Card>
  )
}

export const getSupportedBrowsersForCurrentOS = (
  supportedBrowsers: Record<string, number>,
  operatingSystem: string,
): {
  browserName: string
  browserVersion: number
  browserIcon: JSX.Element | null
  downloadLink: string
}[] => {
  const supportedBrowserNames = Object.keys(supportedBrowsers)

  const browsersBasedOnOS = BROWSERS_ON_OS_TYPES?.[operatingSystem] ?? []

  const osCompatBrowserNames = browsersBasedOnOS.filter(
    browserBasedOnOS => supportedBrowserNames.includes(browserBasedOnOS),
  )

  const osCompatBrowsers = osCompatBrowserNames.map((browser) => {
    const browserVersion = supportedBrowsers[browser]
    const browserName = NAMES_FROM_UA_BROWSERS[browser]
    let browserIcon: JSX.Element | null = null
    switch (browser) {
      case 'and_ff':
      case 'firefox': {
        browserIcon = (
          <img src={firefoxIcon} title="Mozilla Firefox" className={styles.browserIcon} />
        )
        break
      }
      case 'and_chr':
      case 'chrome': {
        browserIcon = (
          <img src={chromeIcon} title="Google Chrome" className={styles.browserIcon} />
        )
        break
      }
      case 'ios_saf':
      case 'safari': {
        browserIcon = (
          <img src={safariIcon} title="Apple Safari" className={styles.browserIcon} />
        )
        break
      }

      case 'edge': {
        browserIcon = (
          <img src={edgeIcon} title="Microsoft Edge" className={styles.browserIcon} />
        )
        break
      }

      default:
        break
    }

    return {
      browserName,
      browserVersion,
      browserIcon,
      downloadLink: BROWSER_DOWNLOAD_LINKS[browser],
    }
  })

  return osCompatBrowsers
}
