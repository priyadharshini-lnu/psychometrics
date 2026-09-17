import React, { useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Avatar, Button, Flex, Modal, Table, Typography,
} from '@thetalententerprise/glint'
import { DateTimeWithZone, ResourceAvatar } from '~/glint'
import {
  DownloadOutlined, CaretRightFilled, EyeOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { RootState } from '~/modules/admin/core/rootReducers'
import { get as getUserRecordings, UserRecording } from '~/modules/admin/modules/AssessorApp/core/userRecordings'

const { I18n } = window

interface PersonEntry {
  id: string | number
  email: string
}

const PersonAvatarGroup: React.FC<{ people: PersonEntry[]; label: string }> = ({ people, label }) => {
  if (!people || people.length === 0) return null

  const avatars = people.map(person => (
    <ResourceAvatar
      key={person.id}
      size="small"
      name={person.email}
      tooltip={person.email}
    />
  ))

  return (
    <Flex align="center" gap={6}>
      <Typography.Text type="secondary">
        {label}
        :
      </Typography.Text>
      {people.length >= 2 ? <Avatar.Group>{avatars}</Avatar.Group> : avatars}
    </Flex>
  )
}

const RecordingPlayer: React.FC<{ url: string }> = ({ url }) => (
  <video
    src={url}
    controls
    controlsList="nodownload"
    className="w-100"
    onContextMenu={e => e.preventDefault()}
  />
)

const connector = connect((state: RootState) => ({
  userRecordings: getUserRecordings(state),
}))

type Props = ConnectedProps<typeof connector>

const RecordingsList: React.FC<Props> = ({ userRecordings }) => {
  const [viewingRecording, setViewingRecording] = useState<UserRecording | null>(null)
  const [viewingTranscription, setViewingTranscription] = useState<UserRecording | null>(null)

  const columns = [
    {
      title: I18n.t('admin.scheduling_columns_serial_no'),
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: I18n.t('admin.scheduling_columns_assessment_center_date_and_time'),
      key: 'date',
      render: (_: unknown, record: UserRecording) => (
        <DateTimeWithZone dateString={record.assessmentCenterDateAndTime || record.recordingDate} />
      ),
    },
    {
      title: I18n.t('admin.scheduling_columns_assessor'),
      key: 'assessors',
      render: (_: unknown, record: UserRecording) => (
        <PersonAvatarGroup
          people={record.assessors}
          label={I18n.t('admin.scheduling_columns_assessor')}
        />
      ),
    },
    {
      title: I18n.t('admin.scheduling_columns_participants'),
      key: 'participants',
      render: (_: unknown, record: UserRecording) => (
        <PersonAvatarGroup
          people={record.participants}
          label={I18n.t('admin.scheduling_columns_participants')}
        />
      ),
    },
    {
      title: I18n.t('admin.scheduling_columns_link_to_view_recordings'),
      key: 'recordingUrl',
      render: (_: unknown, record: UserRecording) => (
        record.recordingUrl ? (
          <Button
            type="link"
            className="ps-0"
            icon={<CaretRightFilled />}
            onClick={() => setViewingRecording(record)}
          >
            {I18n.t('admin.scheduling_columns_view_recording')}
          </Button>
        ) : null
      ),
    },
    {
      title: I18n.t('shared.transcriptions'),
      key: 'transcription',
      render: (_: unknown, record: UserRecording) => (
        <Flex align="center" gap={8}>
          {record.transcriptionUrl && (
            <Button
              type="link"
              className="ps-0"
              icon={<DownloadOutlined />}
              href={record.transcriptionUrl}
              target="_blank"
            >
              {I18n.t('common.text.download')}
            </Button>
          )}
          {record.transcriptionText && (
            <Button
              type="link"
              className="ps-0"
              icon={<EyeOutlined />}
              onClick={() => setViewingTranscription(record)}
            >
              {I18n.t('shared.view_transcription')}
            </Button>
          )}
        </Flex>
      ),
    },
  ]

  return (
    <>
      <Table
        dataSource={userRecordings}
        columns={columns}
        rowKey="id"
        pagination={false}
      />

      {viewingRecording && (
        <Modal
          open
          onCancel={() => setViewingRecording(null)}
          footer={null}
          width={800}
          title={`${I18n.t('shared.recording')} - ${viewingRecording.recordingDate}`}
          destroyOnHidden
        >
          <RecordingPlayer url={viewingRecording.recordingUrl || ''} />
        </Modal>
      )}

      {viewingTranscription && (
        <Modal
          open
          onCancel={() => setViewingTranscription(null)}
          footer={null}
          width={720}
          title={I18n.t('shared.transcription')}
          destroyOnHidden
        >
          <Typography.Paragraph className="p-4">
            {viewingTranscription.transcriptionText || I18n.t('shared.na_text')}
          </Typography.Paragraph>
        </Modal>
      )}
    </>
  )
}

export default connector(RecordingsList)
