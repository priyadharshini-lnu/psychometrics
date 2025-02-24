import React, {
  useEffect, useRef, useState,
} from 'react'
import { Result, Skeleton } from 'antd'
import _ from 'lodash'
import * as pbi from 'powerbi-client'
import styles from './EmbeddedDashboard.less'
import { Dashboard as DashboardType } from '~/modules/admin/modules/campaigns/core/dashboard'

const { I18n } = window
interface OwnProps {
  fitToWidth?: boolean,
  dashboard: DashboardType,
}
type Props = OwnProps

export const EmbeddedPowerBiDashboard: React.FC<Props> = ({
  fitToWidth, dashboard: { reportId, embedToken, visualHeaderVisibility },
}) => {
  const embedContainer = useRef<HTMLDivElement>(null)
  const [powerBiLoaded, setPowerBiLoaded] = useState(false)
  const powerBiServiceRef = useRef<pbi.Embed>()
  const powerBiService = powerBiServiceRef.current

  useEffect(() => {
    if (embedToken) {
      embedPowerBiDashboard()
    }
  }, [embedToken])

  useEffect(() => {
    if (powerBiService) {
      powerBiService.config = embedConfig()
      powerBiService.reload()
    }
  }, [fitToWidth])

  const visualHeaders = () => {
    if (visualHeaderVisibility === 'keep_original') return []

    return [{
      settings: {
        visible: visualHeaderVisibility === 'show_all',
      },
    }]
  }

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
          visualHeaders: visualHeaders(),
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
    <>
      {embedToken && !powerBiLoaded && <div className={styles.skeletonContainer}><Skeleton active /></div>}
      <div ref={embedContainer} className={styles.embedContainer}>
        {_.isNil(embedToken) && (
          <Result
            status="error"
            title={I18n.t('administration.dashboard.preview.embed_token_error_title')}
            subTitle={I18n.t('administration.dashboard.preview.embed_token_error_description')}
          />
        )}
      </div>
    </>
  )
}
