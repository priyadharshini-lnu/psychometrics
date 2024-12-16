import React from 'react'
import cs from 'classnames'
import { AudioLevel } from '~/hooks/useAudioMetrics/interfaces'
import RedMicrophone from './images/red-microphone.png'
import GreenMicrophone from './images/green-microphone.png'
import styles from './styles.less'

interface Props {
  pulse: number
  level: AudioLevel
}

const DynamicAudioIcon: React.FC<Props> = ({ pulse, level }) => (
  <div className={styles.container}>
    <div className={styles.recordingIndicatorContainer}>
      <div
        className={cs(styles.pulsRing, styles[`${level}Audio`])}
        style={{ transform: `scale(${pulse})` }}
      />
      <img
        src={level === AudioLevel.Low ? RedMicrophone : GreenMicrophone}
        className={styles.microphoneImg}
        alt=""
      />
    </div>
  </div>
)

export default DynamicAudioIcon
