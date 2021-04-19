import React from 'react'
import cs from 'classnames'
import { PauseOutlined } from '@ant-design/icons'
import styles from './styles.scss'

interface Props {
  onClick(): void
}

export const PauseButton: React.FC<Props> = ({
  onClick,
}) => (
  <div
    className={cs([styles.mediaBtnContainer, styles.pauseBtnContainer])}
    onClick={onClick}
  >
    <div className={cs([styles.mediaBtn, styles.pauseBtn])}>
      <PauseOutlined className={styles.icon} />
    </div>
  </div>
)
