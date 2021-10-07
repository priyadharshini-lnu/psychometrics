import React from 'react'
import { useParams } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'

import { RootState } from 'modules/admin/core/rootReducers'

import RouteList from 'components/RouteList'
import TopMenu from './TopMenu'
import Breadcrumb from '../../components/Breadcrumb'
import settings from '../../settings'
import routes from './routes'

const { I18n } = window

const connector = connect((state: RootState) => ({
  currentUser: state.currentUser,
}))

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux

const CampaignComponent: React.FC<Props> = ({ currentUser }) => {
  const { campaignId } = useParams<{ campaignId: string }>()

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
            link: () => '/administration',
            label: () => I18n.t('administration.clients.tenancies'),
          },
          {
            link: state => `/administration/clients/${state.client.id}/projects`,
            label: state => state.client.name,
          },
          {
            link: state => `/administration/projects/${state.project.id}/new_campaigns`,
            label: state => state.project.name,
          },
          {
            label: state => state.campaign?.name,
          },
        ]}
      />
      <TopMenu
        prefix={`${settings.urlPrefix}/${campaignId}`}
        currentUser={currentUser}
      />
      <section data-testid="admin_campaign_section">
        <RouteList
          routes={routes}
          urlPrefix={`${settings.urlPrefix}/:campaignId`}
        />
      </section>
    </div>
  )
}

export const Campaign = connector(CampaignComponent)
