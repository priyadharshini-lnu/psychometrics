import { Flex, Skeleton, theme } from 'antd'
import React, { useEffect } from 'react'
import {
  Outlet, useLocation, useNavigate, useParams,
} from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import _ from 'lodash'
import { useResources } from '~/hooks/useResources'
import {
  Dashboard as DashboardType, DashboardTR, useDashboardStore,
} from '~/modules/admin/modules/campaigns/core/dashboard'
import { get as getCurrentCampaign, FETCH as FETCHING_CAMPAIGN } from '~/modules/admin/modules/campaigns/core/current'
import { RootState } from '~/modules/admin/core/rootReducers'
import { get as getCurrentUser, isSuperAdmin } from '~/core/currentUser'
import { isRequestInProgress } from '~/core/request'
import { Menu } from './Menu'
import { ToolsMenu } from './ToolsMenu'

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
  const { campaignId, projectId } = useParams() as { campaignId: string, projectId: string }
  const navigate = useNavigate()
  const location = useLocation()
  const stateManager = useDashboardStore()
  const { token } = theme.useToken()
  const {
    fetch, isRequestSuccessful, data,
  } = useResources<DashboardType>('dashboards', { responseType: DashboardTR, stateManager })
  const dashboard = data[0]
  const basePath = `/admin/projects/${projectId}/new_campaigns/${campaignId}/dashboard`
  const fetchSuccessful = isRequestSuccessful('fetch')
  const dashboardPreviewAvailable = dashboard?.dashboardType === 'powerbi'
    ? (!_.isEmpty(dashboard?.reportId) && !_.isEmpty(dashboard?.datasetId))
    : !_.isEmpty(dashboard?.projectPath)
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
    if (accessiblePaths.includes(location.pathname)) { return }
    if (accessiblePaths[0]) navigate(accessiblePaths[0])
  }, [data, fetchSuccessful, campaignPermissions, campaignLoading, loadingInProgress])

  if (loadingInProgress) return <Skeleton active />

  return (
    <>
      <Flex align="center" style={{ marginBottom: token.margin }}>
        {/* The growing column stretches the strip across the row, and holds the button right when it hides. */}
        <Flex flex="auto" vertical>
          <Menu
            dashboardInitialized={dashboardInitialized}
            dashboardPreviewAvailable={dashboardPreviewAvailable}
            canManageDashboard={canManageDashboard}
            campaignPermissions={campaignPermissions}
          />
        </Flex>
        {dashboardInitialized && dashboardPreviewAvailable && dashboard?.dashboardType === 'powerbi' && (
          <ToolsMenu
            campaignId={campaignId}
            projectId={projectId}
            dashboard={dashboard}
            campaignPermissions={campaignPermissions}
          />
        )}
      </Flex>
      <Outlet />
    </>
  )
}

export const Dashboard = connecter(DashboardComponent)
