import * as t from 'io-ts'
import {
  useParams,
} from 'react-router-dom'
import { Tag } from 'antd'
import { Resource } from '~/modules/admin/components/Resource'
import { WorkshopTR } from '~/modules/admin/modules/campaigns/core/workshop'
import { formatWorkshopDate } from '~/utils/workshop'
import { WorkshopInvitedSubjectTR } from '~/modules/admin/modules/UserAvailability/core/workshopInvitedSubjects'

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
  id: WorkshopTR.props.id,
  name: WorkshopTR.props.name,
  startTime: WorkshopTR.props.startTime,
  workshopInvitedSubjects: t.array(t.type({
    id: WorkshopInvitedSubjectTR.props.id,
    status: WorkshopInvitedSubjectTR.props.status,
    workshopInviteId: WorkshopInvitedSubjectTR.props.workshopInviteId,
  })),
})

type Response = t.TypeOf<typeof ResponseTR>

const WorkshopList: React.FC = () => {
  const { campaignId, id, projectId } = useParams<{ projectId: string, campaignId: string, id: string }>()

  const config = {
    trackUrl: true,
    responseType: ResponseTR,
    basePath: `campaigns/${campaignId}`,
    apiConfig: {
      include: ['workshop_invited_subjects'],
      filter: {
        workshop_invited_subjects_user_id_eq: id,
      },
      fields: {
        workshops: ['id', 'name', 'start_time', 'workshop_invited_subjects'],
        workshop_invited_subjects: ['id', 'status', 'workshop_invite_id'],
      },
    },
  }

  return (
    <Resource config={config} name="workshops">
      <Resource.Table>
        <Resource.Column<Response>
          title={I18n.t('common.column.id')}
          id="id"
          width="3%"
        />
        <Resource.Column<Response>
          title={I18n.t('common.column.name')}
          id="name"
          width="20%"
          render={(_, { name, workshopInvitedSubjects }) => (
            <a
              // eslint-disable-next-line max-len
              href={`/administration/projects/${projectId}/new_campaigns/${campaignId}/scheduling/invites/${workshopInvitedSubjects[0].workshopInviteId}/subjects`}
            >
              {name}
            </a>
          )}
        />
        <Resource.Column<Response>
          title={I18n.t('administration.scheduling.columns.start_time')}
          id="startTime"
          width="15%"
          render={(_, { startTime }) => formatWorkshopDate(startTime)}
        />
        <Resource.Column<Response>
          title={I18n.t('administration.assessment_center.invite_request.status')}
          id="status"
          render={(_, workshop) => (
            <Tag color={STATUSES_TO_COLOR[workshop.workshopInvitedSubjects[0].status]}>
              {I18n.t(`administration.invited_subject.statuses.${workshop.workshopInvitedSubjects[0].status}`)}
            </Tag>
          )}
        />
      </Resource.Table>
    </Resource>
  )
}

export default WorkshopList
