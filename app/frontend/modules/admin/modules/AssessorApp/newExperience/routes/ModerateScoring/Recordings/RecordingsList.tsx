import { FC, useEffect, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  Avatar, Button, Empty, Flex, Modal, Skeleton, Typography,
} from '@thetalententerprise/glint'
import { DateTimeWithZone, ResourceAvatar } from '~/glint'
import {
  CaretRightFilled, DownloadOutlined, EyeOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { RootState } from '~/modules/admin/core/rootReducers'
import {
  FETCH_RECORDINGS,
  UserRecording,
  fetchRecordings,
  getRecordings,
} from '~/modules/admin/modules/AssessorApp/core/scoreModerate'
import { isRequestInProgress } from '~/core/request'
import styles from './Recordings.less'

const { I18n } = window

interface PersonEntry {
  id: string | number
  firstName: string
  lastName: string
}

const PersonAvatarGroup: FC<{ people: PersonEntry[]; label: string }> = ({ people, label }) => {
  if (!people || people.length === 0) return null

  const avatars = people.map(person => (
    <ResourceAvatar
      size="small"
      key={person.id}
      name={`${person.firstName} ${person.lastName}`}
      tooltip={`${person.firstName} ${person.lastName}`}
    />
  ))

  return (
    <Flex align="center" gap={6}>
      <Typography.Text strong>
        {label}
        :
      </Typography.Text>
      {people.length >= 2 ? (
        <Avatar.Group>
          {avatars}
        </Avatar.Group>
      ) : avatars}
    </Flex>
  )
}

const connector = connect((state: RootState) => ({
  userRecordings: getRecordings(state.assessors.scoreModerate),
  loading: isRequestInProgress(state, FETCH_RECORDINGS),
}), { fetchRecordings })

interface Props extends ConnectedProps<typeof connector> {
  header: (title: string, withoutBorder?: boolean) => React.ReactNode
}

const RecordingPlayer: FC<{ url: string }> = ({ url }) => (
  <video
    src={url}
    controls
    controlsList="nodownload"
    className="w-100"
    onContextMenu={event => event.preventDefault()}
  />
)

const RecordingsComponent: FC<Props> = ({
  fetchRecordings, userRecordings, loading, header,
}) => {
  const { campaignId, userId } = useParams<{ campaignId?: string, userId?: string }>()
  const [viewingRecording, setViewingRecording] = useState<UserRecording | null>(null)
  const [viewingTranscription, setViewingTranscription] = useState<UserRecording | null>(null)

  useEffect(() => {
    if (campaignId && userId) {
      fetchRecordings(parseInt(campaignId, 10), parseInt(userId, 10))
    }
  }, [campaignId, fetchRecordings, userId])

  const renderRecordingCard = (recording: UserRecording) => (
    <div key={recording.id} className={styles.recordingRow}>
      <Flex gap={16} wrap="wrap">
        <Button
          className={styles.recordingPreview}
          type="primary"
          icon={<CaretRightFilled className="fs-32" />}
          onClick={() => recording.recordingUrl && setViewingRecording(recording)}
          disabled={!recording.recordingUrl}
          aria-label={I18n.t('admin.scheduling_columns_view_recording')}
        />
        <Flex vertical gap={8} className={styles.recordingDetails}>
          <Typography.Text strong>
            <DateTimeWithZone dateString={recording.assessmentCenterDateAndTime || recording.recordingDate} />
          </Typography.Text>
          <Flex vertical gap={4}>
            <PersonAvatarGroup
              people={recording.assessors}
              label={I18n.t('admin.scheduling_columns_assessor')}
            />
            <PersonAvatarGroup
              people={recording.participants}
              label={I18n.t('admin.scheduling_columns_participants')}
            />
          </Flex>
          <Flex align="center" gap={8} wrap="wrap">
            {recording.recordingUrl && (
              <Button icon={<EyeOutlined />} onClick={() => setViewingRecording(recording)}>
                {I18n.t('shared.view')}
              </Button>
            )}
            {recording.transcriptionUrl && (
              <Button href={recording.transcriptionUrl} target="_blank" icon={<DownloadOutlined />}>
                {I18n.t('shared.download')}
              </Button>
            )}
            {recording.transcriptionText && (
              <Button type="link" className="ps-0" onClick={() => setViewingTranscription(recording)}>
                {I18n.t('shared.view_transcription')}
              </Button>
            )}
          </Flex>
        </Flex>
      </Flex>
    </div>
  )

  const renderBody = () => {
    if (loading) return <Skeleton active className="p-4" />
    if (!userRecordings.length) {
      return (
        <Flex align="center" justify="center" className="p-4">
          <Empty description={I18n.t('shared.no_data_found')} />
        </Flex>
      )
    }

    return (
      <div className={styles.recordingBody}>
        {userRecordings.map(recording => renderRecordingCard(recording))}
      </div>
    )
  }

  return (
    <Flex vertical className="h-100">
      {header(I18n.t('admin.recordings'))}
      {renderBody()}
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
          <Typography.Paragraph className={styles.transcriptionText}>
            {viewingTranscription.transcriptionText || I18n.t('shared.na_text')}
          </Typography.Paragraph>
        </Modal>
      )}
    </Flex>
  )
}

export const Recordings = connector(RecordingsComponent)
