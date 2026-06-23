import * as t from 'io-ts'
import React from 'react'
import {
  useParams,
} from 'react-router-dom'
import { Tag, Typography } from 'antd'
import { Resource } from '~/modules/admin/components/Resource'
import { WorkshopTR } from '~/modules/admin/modules/campaigns/core/workshop'
import { WorkshopSubjectTR } from '~/modules/admin/modules/campaigns/core/workshopSubject'
import { formatWorkshopDate } from '~/utils/workshop'
import dayjs from '~/utils/dayjs'

const { I18n } = window

const ATTENDANCE_TAG_COLORS = {
  no_status: 'default',
  on_time: 'success',
  late: 'warning',
  no_show: 'error',
  dropped_out: 'warning',
}

const SCHEDULING_STATUS_TO_TAG_COLOR = {
  scheduled: 'success',
  rescheduled: 'error',
  cancelled: 'error',
  late_scheduled: 'error',
  late_rescheduled: 'error',
}

const ResponseTR = t.type({
  id: WorkshopSubjectTR.props.id,
  attendanceStatus: WorkshopSubjectTR.props.attendanceStatus,
  schedulingStatus: WorkshopSubjectTR.props.schedulingStatus,
  attended: WorkshopSubjectTR.props.attended,
  createdAt: WorkshopSubjectTR.props.createdAt,
  workshop: t.type({
    id: WorkshopTR.props.id,
    name: WorkshopTR.props.name,
    startTime: WorkshopTR.props.startTime,
  }),
  campaignAssessmentGroupName: t.string,
  campaignAssessmentGroupId: t.number,
})

type Response = t.TypeOf<typeof ResponseTR>

const WorkshopList: React.FC = () => {
  const { campaignId, id, projectId } = useParams() as { projectId: string, campaignId: string, id: string }
  const config = {
    trackUrl: true,
    responseType: ResponseTR,
    basePath: `campaigns/${campaignId}`,
    apiConfig: {
      include: ['workshop'],
      filter: {
        campaign_id_eq: campaignId,
        user_id_eq: id,
      },
      fields: {
        workshops: ['name', 'id', 'start_time'],
      },
    },
  }
  return (
    <>
      <h3>{I18n.t('campaign_users.details.assessment_center')}</h3>
      <Resource config={config} name="workshop_subjects">
        <Resource.Table pagination>
          <Resource.Column<Response>
            title={I18n.t('shared.id')}
            id="id"
            width="3%"
          />
          <Resource.Column<Response>
            title={I18n.t('shared.name')}
            id="name"
            width="20%"
            render={(_, { workshop }) => (
              <a
              // eslint-disable-next-line max-len
                href={`/admin/projects/${projectId}/new_campaigns/${campaignId}/scheduling/assessment_center/${workshop.id}`}
              >
                {workshop.name}
              </a>
            )}
          />
          <Resource.Column<Response>
            title={I18n.t('admin.scheduling_columns_start_time')}
            id="startTime"
            width="15%"
            render={(_, { workshop }) => formatWorkshopDate(workshop.startTime)}
          />
          <Resource.Column<Response>
            title={I18n.t('admin.scheduling_columns_campaign_assessment_group')}
            id="campaignAssessmentGroupName"
            width="10%"
          />
          <Resource.Column<Response>
            title={I18n.t('admin.scheduling_columns_attended')}
            id="attended"
            render={(_, { attended }) => (
              <Tag color={attended ? 'success' : 'error'}>
                {attended
                  ? I18n.t('admin.scheduling_attended_attended')
                  : I18n.t('admin.scheduling_attended_not_attended')
                }
              </Tag>
            )}
          />
          <Resource.Column<Response>
            title={I18n.t('admin.scheduling_attendance_status_column_name')}
            id="attendanceStatus"
            render={(_, { attendanceStatus }) => (
              <Tag color={ATTENDANCE_TAG_COLORS[attendanceStatus]}>
                {I18n.t(`admin.scheduling_attendance_status_${attendanceStatus}`)}
              </Tag>
            )}
          />
          <Resource.Column<Response>
            title={I18n.t('admin.scheduling_columns_booked_at')}
            id="bookedAt"
            render={(_, { createdAt }) => {
              const bookedAt = dayjs(createdAt)
              return (
                <Typography.Text>
                  {`${bookedAt.format('DD MMM, HH:mm')} ${bookedAt.format(' (z)')}`}
                </Typography.Text>
              )
            }}
          />
          <Resource.Column<Response>
            title={I18n.t('admin.scheduling_columns_scheduling_status')}
            id="scheduling_status"
            render={(_, { schedulingStatus }) => (
              <Tag color={SCHEDULING_STATUS_TO_TAG_COLOR[schedulingStatus]}>
                {I18n.t(`admin.scheduling_scheduling_statuses_${schedulingStatus}`)}
              </Tag>
            )}
          />
        </Resource.Table>
      </Resource>
    </>
  )
}

export default WorkshopList
