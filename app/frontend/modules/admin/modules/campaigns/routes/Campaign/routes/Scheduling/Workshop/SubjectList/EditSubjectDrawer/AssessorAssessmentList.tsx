import {
  Table, Button, message, Tag, Space,
} from 'antd'
import { EditOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import dayjs from '~/utils/dayjs'

import { ResourceAvatar } from '~/glint'
import { PROGRESS_STATUSES } from './Constants'
import { AssessorUserAssessment, SubjectUserAssessment } from '~/modules/admin/modules/campaigns/core/workshopSubject'

const { I18n } = window
const { Column } = Table

type Props = {
  assessments: AssessorUserAssessment[]
  onEdit: (data: AssessorUserAssessment) => void
  onDelete: (data: AssessorUserAssessment) => void
  linkedAssessments: Map<string, SubjectUserAssessment> | null
}
export const AssessorAssessmentList = ({
  assessments,
  linkedAssessments,
  onEdit,
  onDelete,
}: Props) => (
  <Table
    pagination={false}
    dataSource={assessments}
    rowKey={data => `${data.assessmentId}_${data.assessor?.id}`}
  >
    <Column
      title={I18n.t('common.column.id')}
      dataIndex="id"
    />
    <Column
      title={I18n.t('common.column.assessment')}
      dataIndex="name"
    />
    <Column
      title={I18n.t('common.column.assessor')}
      dataIndex="assessor"
      render={assessor => (
        assessor && (
          <ResourceAvatar
            name={assessor.name || ''}
            tooltip={assessor.name || ''}
            url={assessor.photoUrl || ''}
          />
        )
      )}
    />
    <Column
      title={I18n.t('common.column.schedule_time')}
      dataIndex="scheduleTime"
      render={scheduleTime => (
        scheduleTime && (
          <span>{dayjs(scheduleTime).format('HH:mm A')}</span>
        )
      )}
    />
    <Column
      title={I18n.t('common.column.meeting_link')}
      dataIndex="meetingLink"
      render={meetingLink => (
        <>
          {meetingLink ? (
            <Space>
              <a href={meetingLink} target="_blank" rel="noreferrer">
                {I18n.t('administration.scheduling.info.join_meeting')}
              </a>
              <CopyToClipboard
                text={meetingLink}
                onCopy={() => message.info(I18n.t('common.text.copied'))}
              >
                <CopyOutlined />
              </CopyToClipboard>
            </Space>
          ) : null}
        </>
      )}
    />
    <Column
      title={I18n.t('common.column.status')}
      dataIndex="status"
      render={(status => (
        status && (
          <Tag color={PROGRESS_STATUSES[status].color}>{PROGRESS_STATUSES[status].label}</Tag>
        )
      ))}
    />
    <Column
      title={I18n.t('common.column.linked_activities')}
      dataIndex="linkedActivityId"
      render={linkedActivityId => (linkedActivityId && linkedAssessments?.get(linkedActivityId)?.name)
      }
    />
    <Column
      title=""
      render={data => (
        <Space key={data.id}>
          <Button onClick={() => onEdit(data)} type="link" icon={<EditOutlined />} />
          <Button disabled={!data.assessor} onClick={() => onDelete(data)} type="link" icon={<DeleteOutlined />} />
        </Space>
      )}
    />
  </Table>
)
