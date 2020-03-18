import React from 'react'
import cs from 'classnames'
import { PauseOutlined } from '@ant-design/icons'
import styles from './MediaButtonsStyle.scss'

interface Props {
  onClick(): void
}

const PauseButton: React.FC<Props> = ({ onClick }) => {
  return (
    <div
      className={cs([styles.mediaBtnContainer, styles.pauseBtnContainer])}
      onClick={onClick}
    >
      <div className={cs([styles.mediaBtn, styles.pauseBtn])}>
        <PauseOutlined className={styles.icon} />
      </div>
    </div>
  )
}

export default PauseButton
