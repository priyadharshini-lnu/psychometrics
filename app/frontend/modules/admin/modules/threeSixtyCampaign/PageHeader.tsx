import { FC } from 'react'
import { useParams } from 'react-router-dom'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import { TopMenu } from './components/TopMenu'

const { I18n } = window
export const PageHeader: FC = () => {
  const {
    projectId,
    campaignId,
    clientId,
  } = useParams<{ projectId: string, clientId: string, campaignId: string }>()
  const parsedCampaignId = parseInt(campaignId, 10)
  return (
    <>
      <Breadcrumb
        request={{
          fields: ['project', 'client', 'threesixty'],
          data: {
            projectId: parseInt(projectId, 10),
            clientId: parseInt(clientId, 10),
            threesixtyId: parsedCampaignId,
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
            link: state => `/administration/projects/${state.project?.id}/new_campaigns?filters[statusEq]=active`,
            label: state => state.project?.name,
          },
          {
            label: state => state.threesixty?.name,
          },
        ]}
      />
      <TopMenu />
    </>
  )
}
