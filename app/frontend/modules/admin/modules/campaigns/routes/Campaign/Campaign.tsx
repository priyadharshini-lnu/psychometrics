import React from 'react'
import { TableConfig } from 'modules/admin/core/filterAndPagination/interfaces'
import RouteList from 'components/RouteList'
import TopMenu from './TopMenu'
import Breadcrumb from '../../components/Breadcrumb'
import settings from '../../settings'
import routes from './routes'

const { I18n } = window

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
    <Breadcrumb
      request={{
        fields: ['project', 'campaign', 'client'],
        data: {
          campaignId: parseInt(campaignId, 10),
        },
      }}
      crumbs={[{
        link: () => '/administration',
        label: () => I18n.t('administration.clients.tenancies'),
      }, {
        link: state => `/administration/clients/${state.client.id}/projects`,
        label: state => state.client.name,
      }, {
        link: state => `/administration/projects/${state.project.id}/new_campaigns`,
        label: state => state.project.name,
      }, {
        label: state => state.campaign?.name,
      }]}
    />
    <TopMenu prefix={`${settings.urlPrefix}/${campaignId}`} />
    <RouteList routes={routes} urlPrefix={`${settings.urlPrefix}/:campaignId`} />
  </div>
)

export default Campaign
