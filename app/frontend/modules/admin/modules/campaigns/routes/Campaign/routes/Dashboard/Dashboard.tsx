import { Skeleton } from 'antd'
import React, { useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import _ from 'lodash'
import { useResources } from '~/hooks/useResources'
import {
  Dashboard as DashboardType, DashboardTR, useDashboardStore,
} from '~/modules/admin/modules/campaigns/core/dashboard'
import settings from '~/modules/admin/modules/campaigns/settings'
import RouteList from '~/components/RouteList'
import { get as getCurrentCampaign, FETCH as FETCHING_CAMPAIGN } from '~/modules/admin/modules/campaigns/core/current'
import { RootState } from '~/modules/admin/core/rootReducers'
import { get as getCurrentUser, isSuperAdmin } from '~/core/currentUser'
import { isRequestInProgress } from '~/core/request'
import { Menu } from './Menu'
import routes from './routes'

const connecter = connect(
  (state: RootState) => ({
    campaignPermissions: getCurrentCampaign(state).permissions,
    currentUser: getCurrentUser(state),
    campaignLoading: isRequestInProgress(state, FETCHING_CAMPAIGN),
  }),
  {},
)
type PropsFromRedux = ConnectedProps<typeof connecter>
type Props =PropsFromRedux

const DashboardComponent: React.FC<Props> = ({ campaignPermissions, currentUser, campaignLoading }) => {
  const history = useHistory()
  const { campaignId, projectId } = useParams<{ campaignId: string, projectId: string }>()
  const stateManager = useDashboardStore()
  const {
    fetch, isRequestSuccessful, data,
  } = useResources<DashboardType>('dashboards', { responseType: DashboardTR, stateManager })
  const basePath = `/admin/projects/${projectId}/new_campaigns/${campaignId}/dashboard`
  const fetchSuccessful = isRequestSuccessful('fetch')
  const dashboardPreviewAvailable = !_.isEmpty(data[0]?.reportId) && !_.isEmpty(data[0]?.datasetId)
  const dashboardInitialized = fetchSuccessful && data.length === 1
  const canManageDashboard = isSuperAdmin(currentUser)
  const loadingInProgress = !fetchSuccessful || campaignLoading

  useEffect(() => {
    fetch({
      apiConfig: {
        filter: { campaign_id_eq: campaignId },
      },
    })
  }, [])

  useEffect(() => {
    if (loadingInProgress) { return }

    let accessiblePaths: string[] = []
    if (!dashboardInitialized && canManageDashboard) {
      accessiblePaths = [...accessiblePaths, `${basePath}/initialize`]
    }
    if (campaignPermissions.viewDashboard && dashboardPreviewAvailable) {
      accessiblePaths = [...accessiblePaths, `${basePath}/preview`]
    }
    if (dashboardInitialized && canManageDashboard) {
      accessiblePaths = [...accessiblePaths, `${basePath}/settings`]
    }
    if (campaignPermissions.viewAccesssheet) {
      accessiblePaths = [...accessiblePaths, `${basePath}/accesssheets`]
    }
    if (campaignPermissions.viewAccesssheetSettings) {
      accessiblePaths = [...accessiblePaths, `${basePath}/accesssheet_settings`]
    }

    if (accessiblePaths.includes(history.location.pathname)) { return }
    if (accessiblePaths[0]) history.push(accessiblePaths[0])
  }, [data, fetchSuccessful, campaignPermissions, campaignLoading])

  if (loadingInProgress) return <Skeleton active />

  return (
    <>
      <Menu
        dashboardInitialized={dashboardInitialized}
        dashboardPreviewAvailable={dashboardPreviewAvailable}
        canManageDashboard={canManageDashboard}
        campaignPermissions={campaignPermissions}
      />
      <RouteList routes={routes} urlPrefix={`${settings.urlPrefix}/:campaignId/dashboard`} />
    </>
  )
}

export const Dashboard = connecter(DashboardComponent)
