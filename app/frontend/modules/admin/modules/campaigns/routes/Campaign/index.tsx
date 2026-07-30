import React from 'react'
import { useParams } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import { get as getCurrentCampaign } from '~/modules/admin/modules/campaigns/core/current'
import { RootState } from '~/modules/admin/core/rootReducers'
import RouteList from '~/components/RouteList'
import Breadcrumb from '../../components/Breadcrumb'
import settings from '../../settings'
import routes from './routes'
import { Navigation } from './Navigation'

const { I18n } = window

const connector = connect(
  (state: RootState) => ({
    campaignPermissions: getCurrentCampaign(state).permissions,
  }),
)

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux

const Campaign: React.FC<Props> = ({ campaignPermissions }) => {
  const { campaignId } = useParams() as { campaignId: string }


  return (
    <div>
      <Breadcrumb
        request={{
          fields: ['project', 'campaign', 'client'],
          data: {
            campaignId: parseInt(campaignId, 10),
          },
        }}
        crumbs={[
          {
            link: () => '/admin',
            label: () => I18n.t('admin.clients'),
          },
          {
            link: state => `/admin/clients/${state.client.id}/projects`,
            label: state => state.client.name,
          },
          {
            link: state => `/admin/projects/${state.project?.id}/new_campaigns`,
            label: state => state.project?.name,
          },
          {
            label: state => state.campaign?.name,
          },
        ]}
      />
      <Navigation prefix={`${settings.urlPrefix}/${campaignId}`} permissions={campaignPermissions} />
      <section data-testid="admin_campaign_section">
        <RouteList
          routes={routes}
          urlPrefix=""
        />
      </section>
    </div>
  )
}

export default connector(Campaign)
