import React from 'react'
import { Skeleton } from 'antd'
import styles from './EmbeddedDashboard.less'
import { Dashboard as DashboardType } from '~/modules/admin/modules/campaigns/core/dashboard'

interface OwnProps {
  dashboard: DashboardType
}

type Props = OwnProps

export const EmbeddedOracleAnalytics: React.FC<Props> = ({
  dashboard: { id, name },
}) => {
  if (!id) {
    return <Skeleton active />
  }

  return (
    <div className={styles.embedContainer}>
      <iframe src={`/administration/dashboards/${id}/oracle_analytics_embed`} title={name} width="100%" height="100%" />
    </div>
  )
}
