import {
  Table, Button, message, Tag, Space,
} from 'antd'
import { EditOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import moment from 'moment'

import { ResourceAvatar } from '~/glint'
import { PROGRESS_STATUSES } from './EditSubjectDrawer'

const { I18n } = window
const { Column } = Table

export const AssessorFormList = ({ assessorAssessments, onEditAssessorForm, onDeleteAssessorForm }) => (
  <Table
    pagination={false}
    dataSource={assessorAssessments}
    rowKey={data => data.id}
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
        <span>{moment(scheduleTime).format('HH:mm A')}</span>
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
      dataIndex="linkedActivity"
    />
    <Column
      title=""
      render={data => (
        <Space key={data.id}>
          <Button onClick={() => onEditAssessorForm(data)} type="link" icon={<EditOutlined />} />
          <Button onClick={() => onDeleteAssessorForm(data.id)} type="link" icon={<DeleteOutlined />} />
        </Space>
      )}
    />
  </Table>
)
