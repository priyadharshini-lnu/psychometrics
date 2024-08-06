import React, {
  useEffect, useRef, useState,
} from 'react'
import { PageHeader } from '@ant-design/pro-layout'
import { Button, Result, Skeleton } from 'antd'
import { ColumnWidthOutlined, FullscreenOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import _ from 'lodash'
import * as pbi from 'powerbi-client'
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
  const navigate = useNavigate()
  const embedContainer = useRef<HTMLDivElement>(null)
  const [isFullScreenMode, setIsFullScreenMode] = useState(alwaysFullScreen)
  const [fitToWidth, setFitToWidth] = useState(false)
  const [powerBiLoaded, setPowerBiLoaded] = useState(false)
  const powerBiServiceRef = useRef<pbi.Embed>()
  const powerBiService = powerBiServiceRef.current
  const fitToWidthButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (embedToken) {
      embedPowerBiDashboard()
    }
  }, [embedToken])

  useEffect(() => {
    if (powerBiService) {
      fitToWidthButtonRef.current?.blur()
      powerBiService.config = embedConfig()
      powerBiService.reload()
    }
  }, [fitToWidth])

  const embedConfig = () => {
    const embedUrl = `https://app.powerbi.com/reportEmbed?reportId=${reportId}`
    const displayOption = pbi.models.DisplayOption
    return {
      type: 'report',
      tokenType: pbi.models.TokenType.Embed,
      accessToken: embedToken as string,
      embedUrl,
      id: reportId,
      settings: {
        layoutType: pbi.models.LayoutType.Custom,
        customLayout: {
          displayOption: fitToWidth ? displayOption.FitToWidth : displayOption.FitToPage,
        },
        visualSettings: {
          visualHeaders: [
            {
              settings: {
                visible: false,
              },
            },
          ],
        },
        panes: {
          filters: {
            visible: false,
          },
          pageNavigation: {
            visible: true,
          },
        },
      },
    }
  }

  const embedPowerBiDashboard = () => {
    if (!embedToken) return

    const { hpmFactory, wpmpFactory, routerFactory } = pbi.factories
    if (embedContainer.current) {
      const powerBiService = new pbi.service.Service(hpmFactory, wpmpFactory, routerFactory).embed(
        embedContainer.current,
        embedConfig(),
      )
      powerBiService.on('loaded', () => setPowerBiLoaded(true))
      powerBiServiceRef.current = powerBiService
    }
  }

  return (
    <div className={cs({ [styles.normalMode]: !isFullScreenMode, [styles.fullScreenMode]: isFullScreenMode })}>
      {embedToken && !powerBiLoaded && <div className={styles.skeletonContainer}><Skeleton active /></div>}
      {isFullScreenMode ? (
        <PageHeader
          className={styles.pageHeader}
          onBack={() => {
            if (alwaysFullScreen) {
              navigate(-1)
            } else {
              setIsFullScreenMode(false)
            }
          }}
          title={dashboardName}
          extra={[
            <Button
              ref={fitToWidthButtonRef}
              type={fitToWidth ? 'primary' : 'default'}
              ghost={fitToWidth}
              onClick={() => setFitToWidth(!fitToWidth)}
              icon={<ColumnWidthOutlined />}
            />,
          ]}
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
