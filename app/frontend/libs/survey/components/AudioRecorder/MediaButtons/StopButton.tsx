import React from 'react'
import cs from 'classnames'
import styles from './MediaButtonsStyle.scss'

interface Props {
  onClick(): void
}

const StopButton: React.FC<Props> = ({ onClick }) => (
  <div
    className={cs([styles.mediaBtnContainer, styles.stopBtnContainer])}
    onClick={onClick}
  >
    <div className={cs([styles.mediaBtn, styles.stopBtn])}>
      <div className={styles.stopIcon} />
    </div>
  </div>
)

export default StopButton
