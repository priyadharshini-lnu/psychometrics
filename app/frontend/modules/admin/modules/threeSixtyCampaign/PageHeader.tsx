import { FC } from 'react'
import { useParams } from 'react-router-dom'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import { TopMenu } from './components/TopMenu'

const { I18n } = window
export const PageHeader: FC = () => {
  const {
    campaignId,
  } = useParams() as { projectId: string, campaignId: string }
  return (
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
      <TopMenu />
    </>
  )
}
