import React, { useEffect, useRef, useState } from 'react'
import { PageHeader, Result, Skeleton } from 'antd'
import { useResources } from 'hooks/useResources'
import { Dashboard as DashboardType, DashboardTR } from 'modules/admin/modules/campaigns/core/dashboard'
import { useHistory, useParams } from 'react-router-dom'
import _ from 'lodash'
import * as pbi from 'powerbi-client'
import { FullscreenOutlined } from '@ant-design/icons'
import cs from 'classnames'
import styles from './styles.less'

const { I18n } = window
interface OwnProps {
  alwaysFullScreen: boolean
}
type Props = OwnProps

export const Preview: React.FC<Props> = ({ alwaysFullScreen = false }) => {
  const history = useHistory()
  const { campaignId } = useParams<{ campaignId: string }>()
  const embedContainer = useRef<HTMLDivElement>(null)
  const {
    fetch, isLoading, data, isRequestSuccessful,
  } = useResources<DashboardType>('dashboards', { responseType: DashboardTR })
  const [isFullScreenMode, setIsFullScreenMode] = useState(alwaysFullScreen)

  const fetchSuccessful = isRequestSuccessful('fetch')

  useEffect(() => {
    fetch({
      apiConfig: {
        filter: { campaign_id_eq: campaignId },
        query: { embed_token: true },
      },
    })
  }, [])

  useEffect(() => {
    if (fetchSuccessful && data[0]?.embedToken) {
      embedPowerBiDashboard()
    }
  }, [fetchSuccessful])

  const embedPowerBiDashboard = () => {
    if (!data[0] || data[0]?.embedToken === null) { return }

    const { reportId } = data[0]
    const embedUrl = `https://app.powerbi.com/reportEmbed?reportId=${reportId}`

    const embedConfig = {
      type: 'report',
      tokenType: pbi.models.TokenType.Embed,
      accessToken: data[0].embedToken,
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

  if (isLoading('fetch')) return <Skeleton active />

  return (
    <div className={cs({ [styles.normalMode]: !isFullScreenMode, [styles.fullScreenMode]: isFullScreenMode })}>
      {isFullScreenMode && (
      <PageHeader
        className={styles.pageHeader}
        onBack={() => {
          if (alwaysFullScreen) {
            history.goBack()
          } else {
            setIsFullScreenMode(false)
          }
        }}
        title={data[0].name}
      />
      )}
      {!isFullScreenMode && (
      <div className={styles.fullScreenIcon} onClick={() => setIsFullScreenMode(true)}>
        <FullscreenOutlined />
      </div>
      )}
      <div ref={embedContainer} className={styles.embedContainer}>
        {fetchSuccessful && _.isNil(data[0]?.embedToken) && (
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
