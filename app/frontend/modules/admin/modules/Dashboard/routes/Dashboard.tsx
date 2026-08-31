import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { connect } from 'react-redux'
import { RootState } from '~/modules/admin/core/rootReducers'
import { triggerCollapse } from '~/modules/admin/core/ui/menu'
import { useResources } from '~/hooks/useResources'
import { Dashboard as DashboardType, DashboardTR } from '~/modules/admin/modules/campaigns/core/dashboard'
import { EmbeddedDashboard } from '../components/EmbeddedDashboard'
import { DocumentTitle } from '~/components/DocumentTitle'
import styles from './Dashboard.less'

const connecter = connect((state:RootState) => ({
  collapsed: state.ui.menu.collapsed,
}), {
  triggerCollapse,
})

export const DashboardComponent = ({ collapsed, triggerCollapse }) => {
  const { dashboardId } = useParams() as { dashboardId: string }
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
    if (!collapsed) {
      triggerCollapse()
    }
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


export const Dashboard = connecter(DashboardComponent)
export default Dashboard
