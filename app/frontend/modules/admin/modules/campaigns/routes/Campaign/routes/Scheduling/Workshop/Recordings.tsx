import React, { useState } from 'react'
import {
  Button,
  Modal,
  Space,
  Tooltip,
} from 'antd'
import { useParams } from 'react-router-dom'
import { ConnectedProps, connect } from 'react-redux'
import { Resource } from '~/modules/admin/components/Resource'
import { get as getCurrentUser } from '~/core/currentUser'
import { WorkshopRecordingTR } from '~/modules/admin/modules/campaigns/core/workshopRecording'

const { I18n } = window

const connector = connect(state => ({
  currentUser: getCurrentUser(state),
}), {})

type PropsFromRedux = ConnectedProps<typeof connector>

export const RecordingsComponent: React.FC<PropsFromRedux> = () => {
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
      <Resource config={config} name="workshop_recordings">
        <RecordingsTable />
      </Resource>
    </>
  )
}

const RecordingsTable = () => (
  <>
    <Resource.Filter hideSearch name="" />
    <Resource.Table pagination>
      <Resource.Column
        title={I18n.t('administration.scheduling.columns.serial_no')}
        id="id"
        width="3%"
      />
      <Resource.Column
        title={I18n.t('administration.scheduling.columns.recording_date')}
        id="recording_date"
        width="5%"
      />
      <Resource.Column
        title={I18n.t('administration.scheduling.columns.assessor')}
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
        title={I18n.t('administration.scheduling.columns.participants')}
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
        title={I18n.t('administration.scheduling.columns.link_to_view_recordings')}
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
    </Resource.Table>
  </>
)

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
        destroyOnClose
      >
        <RecordingPlayer url={recordingUrl} />
      </Modal>
    </>
  )
}


export const Recordings = connector(RecordingsComponent)
