import React, { useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Table, Row, Col, Button,
  Tooltip,
  Modal,
} from 'antd'
import { useBreakpoint } from '@thetalententerprise/glint'
import { DownloadOutlined, EyeInvisibleOutlined, EyeOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { DateTimeWithZone } from '~/glint'
import { getCurrent } from '~/modules/admin/modules/AssessorApp/core/users'
import { get as getUserRecordings } from '~/modules/admin/modules/AssessorApp/core/userRecordings'
import { RootState } from '~/modules/admin/core/rootReducers'
import { TranscriptionDetailsDrawer } from '~/modules/admin/components/Recordings/TranscriptionDetailsDrawer'

const connecter = connect(
  (state: RootState) => ({
    user: getCurrent(state),
    userRecordings: getUserRecordings(state),
  }),
  {
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

const { Column } = Table
const { I18n } = window

const Recordings: React.FC<Props> = ({ userRecordings }) => {
  const [showTranscription, setShowTranscription] = useState(false)
  const [transcriptionText, setTranscriptionText] = useState<string | null>('')
  const [disableTranscriptDownload, setDisableTranscriptDownload] = useState(false)
  const screens = useBreakpoint()

  const closeShowTranscription = () => {
    setShowTranscription(false)
  }

  return (
    <div>
      <Row>
        <Col span={24}>
          <Table
            className="mtm mbl"
            rowKey="id"
            dataSource={userRecordings}
            scroll={{ x: 'max-content' }}
            sticky
            pagination={false}
          >
            <Column
              title={I18n.t('admin.scheduling_columns_serial_no')}
              dataIndex="id"
              key="id"
              fixed={screens.md ? 'left' : undefined}
            />
            <Column
              title={I18n.t('admin.scheduling_columns_recording_date')}
              key="recordingDate"
              dataIndex="recordingDate"
            />
            <Column
              title={I18n.t('admin.scheduling_columns_assessment_center_date_and_time')}
              key="assessmentCenterDateAndTime"
              render={({ assessmentCenterDateAndTime }) => {
                if (!assessmentCenterDateAndTime) return null
                return <DateTimeWithZone dateString={assessmentCenterDateAndTime} />
              }}
            />
            <Column
              title={I18n.t('admin.scheduling_columns_assessor')}
              key="assessors"
              width={200}
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
            <Column
              title={I18n.t('admin.scheduling_columns_participants')}
              key="participants"
              width={200}
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
            <Column
              title={I18n.t('admin.scheduling_columns_link_to_view_recordings')}
              key="recording_url"
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
            <Column
              title={I18n.t('shared.transcriptions')}
              key="transcription_url"
              width="5%"
              render={({
                transcriptionUrl,
                transcriptionText,
                disableTranscriptDownload: recordingDisableTranscriptDownload,
              }) => {
                if (!transcriptionText) return null
                return (
                  <div className="vertical-align">
                    <Button
                      className="ps-0"
                      type="link"
                      icon={showTranscription ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                      onClick={() => {
                        setShowTranscription(!showTranscription)
                        setTranscriptionText(transcriptionText)
                        setDisableTranscriptDownload(recordingDisableTranscriptDownload)
                      }}
                    >
                      View
                    </Button>
                    {transcriptionUrl && (
                      <Button
                        className="ps-0 ms-2"
                        href={transcriptionUrl}
                        target="_blank"
                        icon={<DownloadOutlined />}
                        type="link"
                      >
                        {I18n.t('common.text.download')}
                      </Button>
                    )}
                  </div>
                )
              }}
            />
          </Table>
        </Col>
      </Row>
      <TranscriptionDetailsDrawer
        transcriptionText={transcriptionText || ''}
        closeShowTranscription={closeShowTranscription}
        showTranscription={showTranscription}
        disableTranscriptDownload={disableTranscriptDownload}
      />
    </div>
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

  if (!recordingUrl) return <span>{I18n.t('shared.na_text')}</span>

  return (
    <>
      <Button
        type="link"
        className="ps-0"
        onClick={() => setOpen(true)}
      >
        {I18n.t('admin.scheduling_columns_view_recording')}
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

export default connecter(Recordings)
