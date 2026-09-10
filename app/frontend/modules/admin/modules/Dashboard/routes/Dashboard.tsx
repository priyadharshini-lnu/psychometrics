import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useResources } from '~/hooks/useResources'
import { Dashboard as DashboardType, DashboardTR } from '~/modules/admin/modules/campaigns/core/dashboard'
import { EmbeddedDashboard } from '../components/EmbeddedDashboard'
import { DocumentTitle } from '~/components/DocumentTitle'
import styles from './Dashboard.less'

export const Dashboard = () => {
  const { dashboardId = '' } = useParams()
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
      <DocumentTitle text={dashboard?.name} />
      {dashboard && (
        <EmbeddedDashboard
          alwaysFullScreen
          dashboard={dashboard}
        />
      )}
    </div>
  )
}

export default Dashboard
