import React, { Suspense } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import { PageFallback, usePageHeld } from '~/components/PageFallback'
import { get as getCurrentCampaign } from '~/modules/admin/modules/campaigns/core/current'
import { RootState } from '~/modules/admin/core/rootReducers'
import Breadcrumb from '../../components/Breadcrumb'
import settings from '../../settings'
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
  const held = usePageHeld()

  return (
    <div>
      {!held && (
        <>
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
        </>
      )}
      <section data-testid="admin_campaign_section">
        {/* Tabs claimed by both campaign types pick their page with React.lazy, so they suspend here. */}
        <Suspense fallback={held ? null : <PageFallback />}>
          <Outlet />
        </Suspense>
      </section>
    </div>
  )
}

export default connector(Campaign)
