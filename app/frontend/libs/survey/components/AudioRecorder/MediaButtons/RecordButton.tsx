import React from 'react'
import cs from 'classnames'
import styles from './MediaButtonsStyle.scss'

interface Props {
  onClick?(): void
  className?: string
  recordButtonClass?: string
}

const RecordButton: React.FC<Props> = ({ onClick, className, recordButtonClass }) => (
  <div
    className={cs([styles.mediaBtnContainer, styles.recordBtnContainer, className])}
    onClick={onClick}
  >
    <div className={cs([styles.mediaBtn, styles.recordBtn, recordButtonClass])}>
      <div className={styles.recordIcon} />
    </div>
  </div>
)

export default RecordButton
