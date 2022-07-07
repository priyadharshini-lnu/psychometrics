import { Button, Result, Skeleton } from 'antd'
import React, { useEffect } from 'react'
import { DashboardOutlined } from '@ant-design/icons'
import { useResources } from 'hooks/useResources'
import { Dashboard as DashboardType, DashboardTR } from 'modules/admin/modules/campaigns/core/dashboard'
import { useHistory, useParams } from 'react-router-dom'
import { openModal } from 'modules/admin/core/ui/modals'
import { connect, ConnectedProps } from 'react-redux'
import Modals from 'modules/admin/components/Modals'
import settings from 'modules/admin/modules/campaigns/settings'
import RouteList from 'components/RouteList'
import { DashboardFormModal } from './DashboardFormModal'
import routes from './routes'
import { Menu } from './Menu'

const { I18n } = window
const MODALS = {
  DashboardFormModal,
}

const connecter = connect(
  null,
  {
    openModal,
  },
)
type PropsFromRedux = ConnectedProps<typeof connecter>

const DashboardComponent: React.FC<PropsFromRedux> = ({ openModal }) => {
  const history = useHistory()
  const { campaignId, projectId } = useParams<{ campaignId: string, projectId: string }>()
  const {
    createResource, fetch, isLoading, meta: { recordCount },
  } = useResources<DashboardType>('dashboards', { responseType: DashboardTR })

  useEffect(() => {
    fetch({
      apiConfig: {
        filter: { campaign_id_eq: campaignId },
      },
    })
  }, [])

  useEffect(() => {
    if (recordCount && recordCount !== 0) {
      history.push(`/administration/projects/${projectId}/new_campaigns/${campaignId}/dashboard/settings`)
    }
  }, [recordCount])

  if (isLoading('fetch')) return <Skeleton active />

  if (recordCount === 0) {
    return (
      <div className="pt-4 pb-4 ps-4 pe-4">
        <Result
          icon={<DashboardOutlined />}
          title={I18n.t('administration.dashboard.initialize_msg')}
          extra={(
            <Button
              type="primary"
              onClick={() => {
                openModal('DashboardFormModal', { createDashboard: createResource })
              }}
            >
              {I18n.t('administration.dashboard.get_started')}
            </Button>
        )}
        />
        <Modals modals={MODALS} />
      </div>
    )
  }

  return (
    <>
      <Menu />
      <RouteList routes={routes} urlPrefix={`${settings.urlPrefix}/:campaignId/dashboard`} />
    </>
  )
}

export const Dashboard = connecter(DashboardComponent)
