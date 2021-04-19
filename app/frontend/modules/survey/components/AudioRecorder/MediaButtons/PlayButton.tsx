import React from 'react'
import cs from 'classnames'
import { CaretRightOutlined } from '@ant-design/icons'
import styles from './styles.scss'

interface Props {
  onClick(): void
}

export const PlayButton: React.FC<Props> = ({ onClick }) => (
  <div
    className={cs([styles.mediaBtnContainer, styles.playBtnContainer])}
    onClick={onClick}
  >
    <div className={cs([styles.mediaBtn, styles.playBtn])}>
      <CaretRightOutlined className={styles.icon} />
    </div>
  </div>
)
