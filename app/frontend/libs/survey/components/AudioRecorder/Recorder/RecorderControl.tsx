import React from 'react'
import _ from 'lodash'
import styles from '../AudioRecorderStyle.scss'
import MediaButtons from '../MediaButtons'
import { RECORDER_STATES } from '../constants'

interface Props {
  recordingState: string;
  startRecording(): void;
  pauseRecording(): void,
  stopRecording(): void,
}

const RecorderControl: React.FC<Props> = ({ recordingState, startRecording, pauseRecording, stopRecording, }) => {
  return (
    <div className={styles.controls}>
      {recordingState === RECORDER_STATES.READY && <MediaButtons.RecordButton onClick={startRecording} />}
      {recordingState === RECORDER_STATES.RECORDING && <MediaButtons.PauseButton onClick={pauseRecording} />}
      {recordingState === RECORDER_STATES.PAUSED && <MediaButtons.PlayButton onClick={startRecording} />}
      {_.includes([RECORDER_STATES.RECORDING, RECORDER_STATES.PAUSED], recordingState)
        && <MediaButtons.StopButton onClick={stopRecording} />}
    </div>
  )
}

export default RecorderControl
