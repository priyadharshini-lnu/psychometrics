import React, { useState } from 'react'
import {
  Button,
  Modal,
  Space,
  Tooltip,
} from 'antd'
import { useParams } from 'react-router-dom'
import { DownloadOutlined, EyeInvisibleOutlined, EyeOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { DateTimeWithZone } from '~/glint'
import { Resource } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import { UserRecordingTR } from './userRecordings'
import { TranscriptionDetailsDrawer } from '~/modules/admin/components/Recordings/TranscriptionDetailsDrawer'

const { I18n } = window

export const RecordingsComponent = () => {
  const { id, campaignId } = useParams() as { id: string, campaignId: string }

  const config = {
    trackUrl: true,
    responseType: UserRecordingTR,
    basePath: `campaigns/${campaignId}/subjects/${id}/`,
  }

  return (
    <>
      <Resource
        title={I18n.t('assessments_reports.menu.recordings')}
        config={config}
        name="meeting_recordings"
        settingsKey={TABLE_SETTINGS_KEYS.campaignParticipantsSubjectRecordings}
      >
        <RecordingsTable />
      </Resource>
    </>
  )
}

const RecordingsTable = () => {
  const [showTranscription, setShowTranscription] = useState(false)
  const [transcriptionText, setTranscriptionText] = useState<string | null>('')

  const closeShowTranscription = () => {
    setShowTranscription(false)
  }

  return (
    <>
      <Resource.Filter hideSearch name="" />
      <Resource.Table pagination>
        <Resource.Column
          title={I18n.t('admin.scheduling_columns_serial_no')}
          id="id"
          hideable={false}
          width="3%"
          fixed="left"
        />
        <Resource.Column
          title={I18n.t('admin.scheduling_columns_recording_date')}
          id="recordingDate"
          width="5%"
          fixed="left"
        />
        <Resource.Column
          title={I18n.t('admin.scheduling_columns_assessment_center_date_and_time')}
          id="assessmentCenterDateAndTime"
          width="5%"
          render={({ assessmentCenterDateAndTime }) => {
            if (!assessmentCenterDateAndTime) return null
            return <DateTimeWithZone dateString={assessmentCenterDateAndTime} />
          }}
        />
        <Resource.Column
          title={I18n.t('admin.scheduling_columns_assessor')}
          id="assessors"
          width="5%"
          render={({ assessors }) => {
            if (!assessors || assessors.length === 0) return null
            const maxShown = 1
            const shown = assessors.slice(0, maxShown)
            const hidden = assessors.slice(maxShown)
            const emails = assessors.map(assessor => assessor.email).join(', ')
            return (
              <Tooltip title={emails}>
                <span>
                  {shown.map(assessor => assessor.email).join(', ')}
                  {hidden.length > 0 && (
                    <>{`+ ${hidden.length}`}</>
                  )}
                </span>
              </Tooltip>
            )
          }}
        />
        <Resource.Column
          title={I18n.t('admin.scheduling_columns_participants')}
          id="participants"
          width="5%"
          render={({ participants }) => {
            if (!participants || participants.length === 0) return null
            const maxShown = 1
            const shown = participants.slice(0, maxShown)
            const hidden = participants.slice(maxShown)
            const emails = participants.map(participant => participant.email).join(', ')
            return (
              <Tooltip title={emails}>
                <span>
                  {shown.map(participant => participant.email).join(', ')}
                  {hidden.length > 0 && (
                    <>{`+ ${hidden.length}`}</>
                  )}
                </span>
              </Tooltip>
            )
          }}
        />
        <Resource.Column
          title={I18n.t('admin.scheduling_columns_link_to_view_recordings')}
          id="recording_url"
          width="5%"
          render={({ recordingUrl, recordingDate, id }) => (
            <RecordingUrlColumn
              recordingUrl={recordingUrl}
              recordingDate={recordingDate}
              serialNo={id}
            />
          )}
        />
        <Resource.Column
          title={I18n.t('shared.transcriptions')}
          id="transcription_url"
          width="5%"
          render={({ transcriptionUrl, transcriptionText }) => {
            if (!transcriptionUrl) return null
            return (
              <div className="vertical-align">
                <Button
                  className="ps-0"
                  type="link"
                  icon={showTranscription ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  onClick={() => {
                    setShowTranscription(!showTranscription)
                    setTranscriptionText(transcriptionText)
                  }}
                >
                  View
                </Button>
                <Button
                  className="ps-0 ms-2"
                  href={transcriptionUrl}
                  target="_blank"
                  icon={<DownloadOutlined />}
                  type="link"
                >
                  {I18n.t('shared.download')}
                </Button>
              </div>
            )
          }}
          fixed="right"
        />
      </Resource.Table>
      <TranscriptionDetailsDrawer
        transcriptionText={transcriptionText || ''}
        closeShowTranscription={closeShowTranscription}
        showTranscription={showTranscription}
      />
    </>
  )
}

const RecordingPlayer: React.FC<{ url: string }> = ({ url }) => (
  <video
    src={url}
    controls
    controlsList="nodownload"
    style={{ width: '100%' }}
    onContextMenu={e => e.preventDefault()}
  />
)

const RecordingUrlColumn: React.FC<{
  recordingUrl: string
  recordingDate: string
  serialNo: number | string
}> = ({ recordingUrl, recordingDate, serialNo }) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Space>
        <Button
          type="link"
          onClick={() => setOpen(true)}
        >
          View recording
        </Button>
      </Space>
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={800}
        title={`Recording #${serialNo} - ${recordingDate}`}
        destroyOnHidden
      >
        <RecordingPlayer url={recordingUrl} />
      </Modal>
    </>
  )
}

export const Recordings = RecordingsComponent
