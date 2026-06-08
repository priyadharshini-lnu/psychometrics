import {
  Table, Button, message, Tag, Space,
} from 'antd'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { EditOutlined, CopyOutlined, DeleteOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import dayjs from '~/utils/dayjs'

import { ResourceAvatar } from '~/glint'
import { PROGRESS_STATUSES } from './Constants'
import { AssessorUserAssessment } from '~/modules/admin/modules/campaigns/core/workshopSubject'

const { I18n } = window
const { Column } = Table

type Props = {
  assessments: AssessorUserAssessment[]
  onEdit: (data: AssessorUserAssessment) => void
  onDelete: (data: AssessorUserAssessment) => void
}
export const AssessorAssessmentList = ({
  assessments,
  onEdit,
  onDelete,
}: Props) => (
  <Table
    pagination={false}
    dataSource={assessments}
    rowKey={data => `${data.assessmentId}_${data.assessor?.id}`}
  >
    <Column
      title={I18n.t('shared.id')}
      dataIndex="id"
    />
    <Column
      title={I18n.t('shared.assessment')}
      dataIndex="name"
    />
    <Column
      title={I18n.t('shared.assessor')}
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
      title={I18n.t('shared.schedule_time')}
      dataIndex="scheduleTime"
      render={scheduleTime => (
        scheduleTime && (
          <span>{dayjs(scheduleTime).format('HH:mm A')}</span>
        )
      )}
    />
    <Column
      title={I18n.t('shared.meeting_link')}
      dataIndex="meetingLink"
      render={meetingLink => (
        <>
          {meetingLink ? (
            <Space>
              <a href={meetingLink} target="_blank" rel="noreferrer">
                {I18n.t('admin.scheduling_info_join_meeting')}
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
      title={I18n.t('shared.status')}
      dataIndex="status"
      render={(status => (
        status && (
          <Tag color={PROGRESS_STATUSES[status].color}>{PROGRESS_STATUSES[status].label}</Tag>
        )
      ))}
    />
    <Column
      title={I18n.t('shared.linked_activities')}
      dataIndex="linkedActivityName"
      render={linkedActivityName => (linkedActivityName && linkedActivityName)}
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
