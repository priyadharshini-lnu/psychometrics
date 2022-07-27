import React, { useEffect, useRef, useState } from 'react'
import { PageHeader, Result } from 'antd'
import { useHistory } from 'react-router-dom'
import _ from 'lodash'
import * as pbi from 'powerbi-client'
import { FullscreenOutlined } from '@ant-design/icons'
import cs from 'classnames'
import styles from './EmbeddedDashboard.less'

const { I18n } = window
interface OwnProps {
  alwaysFullScreen?: boolean
  dashboardName: string
  embedToken?: string | null
  reportId?: string | null
}
type Props = OwnProps

export const EmbeddedDashboard: React.FC<Props> = ({
  alwaysFullScreen = false, dashboardName, embedToken, reportId,
}) => {
  const history = useHistory()
  const embedContainer = useRef<HTMLDivElement>(null)
  const [isFullScreenMode, setIsFullScreenMode] = useState(alwaysFullScreen)

  useEffect(() => {
    if (embedToken) {
      embedPowerBiDashboard()
    }
  }, [embedToken])

  const embedPowerBiDashboard = () => {
    if (!embedToken) return

    const embedUrl = `https://app.powerbi.com/reportEmbed?reportId=${reportId}`

    const embedConfig = {
      type: 'report',
      tokenType: pbi.models.TokenType.Embed,
      accessToken: embedToken,
      embedUrl,
      id: reportId,
      settings: {
        layoutType: pbi.models.LayoutType.Custom,
        customLayout: {
          displayOption: pbi.models.DisplayOption.FitToPage,
        },
        panes: {
          filters: {
            visible: true,
          },
          pageNavigation: {
            visible: true,
          },
        },
      },
    }

    const { hpmFactory, wpmpFactory, routerFactory } = pbi.factories
    if (embedContainer.current) {
      new pbi.service.Service(hpmFactory, wpmpFactory, routerFactory).embed(
        embedContainer.current,
        embedConfig,
      )
    }
  }

  return (
    <div className={cs({ [styles.normalMode]: !isFullScreenMode, [styles.fullScreenMode]: isFullScreenMode })}>
      {isFullScreenMode ? (
        <PageHeader
          className={styles.pageHeader}
          onBack={() => {
            if (alwaysFullScreen) {
              history.goBack()
            } else {
              setIsFullScreenMode(false)
            }
          }}
          title={dashboardName}
        />
      ) : (
        <div className={styles.fullScreenIcon} onClick={() => setIsFullScreenMode(true)}>
          <FullscreenOutlined />
        </div>
      )}
      <div ref={embedContainer} className={styles.embedContainer}>
        {_.isNil(embedToken) && (
        <Result
          status="error"
          title={I18n.t('administration.dashboard.preview.embed_token_error_title')}
          subTitle={I18n.t('administration.dashboard.preview.embed_token_error_description')}
        />
        )}
      </div>
    </div>
  )
}
