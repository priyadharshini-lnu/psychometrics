import React from 'react'
import { Button, Space } from 'antd'

import { RECORDER_STATES } from 'modules/survey/constants/media'

const { I18n } = window

interface Props {
  recordingState: string
  startRecording(): void
  pauseRecording(): void
  stopRecording(): void
  disableRecording?: boolean
}

export const RecorderControl: React.FC<Props> = ({
  recordingState,
  startRecording,
  pauseRecording,
  stopRecording,
  disableRecording,
}) => {
  const isRecordingInitiated = [
    RECORDER_STATES.RECORDING,
    RECORDER_STATES.PAUSED,
  ].includes(recordingState)

  return (
    <Space>
      {recordingState === RECORDER_STATES.READY && (
        <Button
          type="primary"
          onClick={startRecording}
          disabled={disableRecording || false}
        >
          {I18n.t('assessments.audio_response.start_recording')}
        </Button>
      )}
      {recordingState === RECORDER_STATES.RECORDING && (
        <Button onClick={pauseRecording}>
          {I18n.t('assessments.audio_response.pause')}
        </Button>
      )}
      {recordingState === RECORDER_STATES.PAUSED && (
        <Button onClick={startRecording}>
          {I18n.t('assessments.audio_response.resume')}
        </Button>
      )}
      {isRecordingInitiated && (
        <Button onClick={stopRecording}>
          {I18n.t('assessments.audio_response.stop')}
        </Button>
      )}
    </Space>
  )
}
