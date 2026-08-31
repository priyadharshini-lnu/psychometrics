import React, { ReactNode, useState } from 'react'
import {
  Button,
  Modal,
  Tooltip,
} from 'antd'
import { useParams } from 'react-router-dom'
import { ConnectedProps, connect } from 'react-redux'
import { DownloadOutlined, EyeInvisibleOutlined, EyeOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { Resource } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import { get as getCurrentUser } from '~/core/currentUser'
import { WorkshopRecordingTR } from '~/modules/admin/modules/campaigns/core/workshopRecording'
import { TranscriptionDetailsDrawer } from '~/modules/admin/components/Recordings/TranscriptionDetailsDrawer'

const { I18n } = window

const connector = connect(state => ({
  currentUser: getCurrentUser(state),
}), {})

type PropsFromRedux = ConnectedProps<typeof connector>

export const RecordingsComponent: React.FC<PropsFromRedux & { toggle?: ReactNode }> = ({ toggle }) => {
  const { id, campaignId } = useParams() as { id: string, campaignId: string }

  const config = {
    trackUrl: true,
    responseType: WorkshopRecordingTR,
    basePath: `campaigns/${campaignId}/workshops/${id}/`,
    apiConfig: {
      include_meta: ['permissions'],
    },
  }

  return (
    <>
      <Resource
        title={I18n.t('admin.scheduling_tabs_assessment_center')}
        config={config}
        name="workshop_recordings"
        settingsKey={TABLE_SETTINGS_KEYS.campaignSchedulingAssessmentCenterRecordings}
      >
        <RecordingsTable toggle={toggle} />
      </Resource>
    </>
  )
}

const RecordingsTable: React.FC<{ toggle?: ReactNode }> = ({ toggle }) => {
  const [showTranscription, setShowTranscription] = useState(false)
  const [transcriptionText, setTranscriptionText] = useState<string | null>('')

  const closeShowTranscription = () => {
    setShowTranscription(false)
  }

  return (
    <>
      <Resource.Filter hideSearch name="" controls={toggle} />
      <Resource.Table embedded pagination>
        <Resource.Column
          title={I18n.t('admin.scheduling_columns_serial_no')}
          id="id"
          hideable={false}
          width="3%"
          fixed="left"
        />
        <Resource.Column
          title={I18n.t('admin.scheduling_columns_recording_date')}
          id="recording_date"
          width="5%"
          fixed="left"
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
          render={({ recordingUrl, recordingDate, id }) => {
            if (!recordingUrl) return null
            return (
              <RecordingUrlColumn
                recordingUrl={recordingUrl}
                recordingDate={recordingDate}
                serialNo={id}
              />
            )
          }}
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

  if (!recordingUrl) return <span>NA</span>

  return (
    <>
      <Button
        type="link"
        className="ps-0"
        onClick={() => setOpen(true)}
      >
        View recording
      </Button>
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

export const Recordings = connector(RecordingsComponent)
