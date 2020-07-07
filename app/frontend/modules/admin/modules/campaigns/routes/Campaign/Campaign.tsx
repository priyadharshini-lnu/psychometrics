import React from 'react'
import { TableConfig } from 'modules/admin/core/filterAndPagination/interfaces'
import RouteList from 'components/RouteList'
import TopMenu from './TopMenu'
import settings from '../../settings'
import routes from './routes'

interface Props {
  fetch(projectId: string, tableConfig: TableConfig): void
  match: {
    params: {
      projectId: string,
      campaignId: string
    }
  }
}

const Campaign: React.FC<Props> = ({
  match: { params: { campaignId } },
}) => (
  <div>
    <TopMenu prefix={`${settings.urlPrefix}/${campaignId}`} />
    <RouteList routes={routes} urlPrefix={`${settings.urlPrefix}/:campaignId`} />
  </div>
)

export default Campaign
