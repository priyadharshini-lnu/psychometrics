import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import { createPortal } from 'react-dom'
import { get as getCurrentCampaign, fetch } from '~/modules/admin/modules/campaigns/core/current'
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
  {
    fetch,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>

interface OwnProps {
  fetch(id: number, projectId: number): Promise<void>
}

type Props = PropsFromRedux & OwnProps

const CampaignComponent: React.FC<Props> = ({ fetch, campaignPermissions }) => {
  const { campaignId } = useParams<{ campaignId: string }>()
  const { projectId } = useParams<{ projectId: string }>()

  useEffect(() => {
    fetch(parseInt(campaignId, 10), parseInt(projectId, 10))
  }, [campaignId])
  const node = document.getElementById('sub_navigation')


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
      {node && createPortal(<Navigation
        prefix={`${settings.urlPrefix}/${campaignId}`}
        permissions={campaignPermissions}
      />, node)}
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
