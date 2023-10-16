import * as t from 'io-ts'
import React from 'react'
import {
  useParams,
} from 'react-router-dom'
import { Tag } from 'antd'
import { Resource } from '~/modules/admin/components/Resource'
import { WorkshopTR } from '~/modules/admin/modules/campaigns/core/workshop'
import { WorkshopSubjectTR } from '~/modules/admin/modules/campaigns/core/workshopSubject'
import { formatWorkshopDate } from '~/utils/workshop'

const { I18n } = window

const ATTENDANCE_TAG_COLORS = {
  no_status: 'default',
  on_time: 'success',
  late: 'warning',
  no_show: 'error',
  dropped_out: 'warning',
}

const ResponseTR = t.type({
  id: WorkshopSubjectTR.props.id,
  attendanceStatus: WorkshopSubjectTR.props.attendanceStatus,
  schedulingStatus: WorkshopSubjectTR.props.schedulingStatus,
  workshop: t.type({
    id: WorkshopTR.props.id,
    name: WorkshopTR.props.name,
    startTime: WorkshopTR.props.startTime,
  }),
})

type Response = t.TypeOf<typeof ResponseTR>

const WorkshopList: React.FC = () => {
  const { campaignId, id, projectId } = useParams<{ projectId: string, campaignId: string, id: string }>()
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
    <Resource config={config} name="workshop_subjects">
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
          title={I18n.t('administration.scheduling.columns.start_time')}
          id="startTime"
          width="15%"
          render={(_, { workshop }) => formatWorkshopDate(workshop.startTime)}
        />
        <Resource.Column<Response>
          title={I18n.t('administration.scheduling.attendance_status.column_name')}
          id="attendanceStatus"
          render={(_, { attendanceStatus }) => (
            <Tag color={ATTENDANCE_TAG_COLORS[attendanceStatus]}>
              {I18n.t(`administration.scheduling.attendance_status.${attendanceStatus}`)}
            </Tag>
          )}
        />
      </Resource.Table>
    </Resource>
  )
}

export default WorkshopList
