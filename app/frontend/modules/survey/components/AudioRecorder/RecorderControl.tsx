import React from 'react'
import { Button, Space } from 'antd'

import { RECORDER_STATES } from 'modules/survey/constants/media'

interface Props {
  recordingState: string
  startRecording(): void
  pauseRecording(): void
  stopRecording(): void
}

export const RecorderControl: React.FC<Props> = ({
  recordingState,
  startRecording,
  pauseRecording,
  stopRecording,
}) => {
  const isRecordingInitiated = [
    RECORDER_STATES.RECORDING,
    RECORDER_STATES.PAUSED,
  ].includes(recordingState)

  return (
    <Space>
      {recordingState === RECORDER_STATES.READY && (
        <Button type="primary" onClick={startRecording}>
          Start recording
        </Button>
      )}
      {recordingState === RECORDER_STATES.RECORDING && (
        <Button onClick={pauseRecording}>Pause</Button>
      )}
      {recordingState === RECORDER_STATES.PAUSED && (
        <Button onClick={startRecording}>Resume</Button>
      )}
      {isRecordingInitiated && <Button onClick={stopRecording}>Stop</Button>}
    </Space>
  )
}
