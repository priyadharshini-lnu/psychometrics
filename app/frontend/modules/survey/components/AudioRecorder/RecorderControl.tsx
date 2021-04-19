import React from 'react'
import _ from 'lodash'
import { RECORDER_STATES } from 'modules/survey/constants/media'
import styles from './styles.scss'
import {
  RecordButton, PauseButton, PlayButton, StopButton,
} from './MediaButtons'

interface Props {
  recordingState: string;
  startRecording(): void;
  pauseRecording(): void,
  stopRecording(): void,
}

export const RecorderControl: React.FC<Props> = ({
  recordingState, startRecording, pauseRecording, stopRecording,
}) => (
  <div className={styles.controls}>
    {recordingState === RECORDER_STATES.READY && <RecordButton onClick={startRecording} />}
    {recordingState === RECORDER_STATES.RECORDING && <PauseButton onClick={pauseRecording} />}
    {recordingState === RECORDER_STATES.PAUSED && <PlayButton onClick={startRecording} />}
    {_.includes([RECORDER_STATES.RECORDING, RECORDER_STATES.PAUSED], recordingState)
        && <StopButton onClick={stopRecording} />}
  </div>
)
