import React, { useEffect } from 'react'
import { Skeleton } from 'antd'
import { useResources } from 'hooks/useResources'
import { Dashboard as DashboardType, DashboardTR } from 'modules/admin/modules/campaigns/core/dashboard'
import { useParams } from 'react-router-dom'
import { EmbeddedDashboard } from '../components/EmbeddedDashboard'
import styles from './Dashboard.less'

export const Dashboard = () => {
  const { dashboardId } = useParams<{ dashboardId: string }>()
  const {
    fetchSingle, getResource,
  } = useResources<DashboardType>('dashboards', { responseType: DashboardTR })

  const dashboard = getResource(dashboardId)

  useEffect(() => {
    fetchSingle({
      id: dashboardId,
      apiConfig: {
        query: { embed_token: true },
      },
    })
  }, [])

  return (
    <div className={styles.fullScreen}>
      {dashboard ? (
        <EmbeddedDashboard
          alwaysFullScreen
          dashboardName={dashboard.name}
          embedToken={dashboard.embedToken}
          reportId={dashboard.reportId}
        />
      )
        : <Skeleton active />}
    </div>
  )
}
