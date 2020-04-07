import React from 'react'
import cs from 'classnames'
import styles from './MediaButtonsStyle.scss'

interface Props {
  onClick(): void
}

const RecordButton: React.FC<Props> = ({ onClick }) => (
  <div
    className={cs([styles.mediaBtnContainer, styles.recordBtnContainer])}
    onClick={onClick}
  >
    <div className={cs([styles.mediaBtn, styles.recordBtn])}>
      <div className={styles.recordIcon} />
    </div>
  </div>
)

export default RecordButton
