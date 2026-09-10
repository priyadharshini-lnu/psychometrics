import React, {
  useEffect, useRef, useState,
} from 'react'
import { PageHeader } from '@ant-design/pro-components'
import { Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import * as pbi from 'powerbi-client'
import cs from 'classnames'
import { ColumnWidthOutlined, FullscreenOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import styles from './EmbeddedDashboard.less'
import { EmbeddedPowerBiDashboard } from './EmbeddedPowerBiDashboard'
import { Dashboard as DashboardType } from '~/modules/admin/modules/campaigns/core/dashboard'
import { EmbeddedOracleAnalytics } from './EmbeddedOracleAnalytics'
import { settings } from '../../settings'

interface OwnProps {
  alwaysFullScreen?: boolean
  dashboard: DashboardType
}
type Props = OwnProps

export const EmbeddedDashboard: React.FC<Props> = ({
  alwaysFullScreen = false, dashboard,
}) => {
  const navigate = useNavigate()
  const [isFullScreenMode, setIsFullScreenMode] = useState(alwaysFullScreen)
  const [fitToWidth, setFitToWidth] = useState(false)
  const powerBiServiceRef = useRef<pbi.Embed>()
  const powerBiService = powerBiServiceRef.current
  const fitToWidthButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (powerBiService) {
      fitToWidthButtonRef.current?.blur()
    }
  }, [fitToWidth])
  const isPowerBiDashboard = dashboard.dashboardType === 'powerbi'
  const isOracleAnalyticsDashboard = dashboard.dashboardType === 'oracle_analytics'

  return (
    <div className={cs({ [styles.normalMode]: !isFullScreenMode, [styles.fullScreenMode]: isFullScreenMode })}>
      {isFullScreenMode ? (
        <PageHeader
          className={styles.pageHeader}
          onBack={() => {
            if (alwaysFullScreen) {
              navigate(settings.urlPrefix)
            } else {
              setIsFullScreenMode(false)
            }
          }}
          title={dashboard.name}
          extra={[
            isPowerBiDashboard && (
              <Button
                ref={fitToWidthButtonRef}
                type={fitToWidth ? 'primary' : 'default'}
                ghost={fitToWidth}
                onClick={() => setFitToWidth(!fitToWidth)}
                icon={<ColumnWidthOutlined />}
              />
            ),
          ]}
        />
      ) : (
        <div className={styles.fullScreenIcon} onClick={() => setIsFullScreenMode(true)}>
          <FullscreenOutlined />
        </div>
      )}
      {isPowerBiDashboard && <EmbeddedPowerBiDashboard dashboard={dashboard} />}
      {isOracleAnalyticsDashboard && <EmbeddedOracleAnalytics dashboard={dashboard} />}
    </div>
  )
}
