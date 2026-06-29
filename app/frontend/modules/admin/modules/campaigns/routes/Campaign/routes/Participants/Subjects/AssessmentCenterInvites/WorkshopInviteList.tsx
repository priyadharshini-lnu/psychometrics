import * as t from 'io-ts'
import {
  useParams,
} from 'react-router-dom'
import { Tag } from 'antd'
import { Resource } from '~/modules/admin/components/Resource'

const { I18n } = window

const STATUSES_TO_COLOR = {
  pending: 'default',
  accepted: 'success',
  cancelled: 'error',
  requested_cancellation: 'warning',
  requested_cancellation_rejected: 'error',
  requested_rescheduling: 'warning',
  requested_rescheduling_rejected: 'error',
  rescheduled: 'success',
}

const ResponseTR = t.type({
  id: t.string,
  status: t.string,
  workshopInvite: t.type({
    id: t.string,
    title: t.string,
  }),
})

type Response = t.TypeOf<typeof ResponseTR>

const WorkshopList: React.FC = () => {
  const { campaignId, id, projectId } = useParams() as { projectId: string, campaignId: string, id: string }

  const config = {
    trackUrl: true,
    responseType: ResponseTR,
    basePath: `campaigns/${campaignId}`,
    apiConfig: {
      include: ['workshop_invite'],
      filter: {
        user_id_eq: id,
      },
      fields: {
        workshop_invites: ['id', 'title'],
      },
    },
  }

  return (
    <>
      <h3>{I18n.t('admin.assessment_center_invites')}</h3>
      <Resource config={config} name="workshop_invited_subjects">
        <Resource.Table pagination>
          <Resource.Column<Response>
            title={I18n.t('shared.id')}
            id="id"
            width="3%"
          />
          <Resource.Column<Response>
            title={I18n.t('admin.scheduling_columns_title')}
            id="name"
            width="20%"
            render={(_, { workshopInvite }) => (
              <a
              // eslint-disable-next-line max-len
                href={`/admin/projects/${projectId}/new_campaigns/${campaignId}/scheduling/invites/${workshopInvite.id}/subjects`}
              >
                {workshopInvite?.title}
              </a>
            )}
          />
          <Resource.Column<Response>
            title={I18n.t('shared.status')}
            id="status"
            render={(_, workshopInvitedSubject) => (
              <Tag color={STATUSES_TO_COLOR[workshopInvitedSubject.status]}>
                {I18n.t(`admin.statuses_${workshopInvitedSubject.status}`)}
              </Tag>
            )}
          />
        </Resource.Table>
      </Resource>
    </>
  )
}

export default WorkshopList
