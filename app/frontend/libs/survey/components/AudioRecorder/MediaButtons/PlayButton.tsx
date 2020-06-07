import React from 'react'
import cs from 'classnames'
import { CaretRightOutlined } from '@ant-design/icons'
import styles from './MediaButtonsStyle.scss'

interface Props {
  onClick(): void
}

const PlayButton: React.FC<Props> = ({ onClick }) => (
  <div
    className={cs([styles.mediaBtnContainer, styles.playBtnContainer])}
    onClick={onClick}
  >
    <div className={cs([styles.mediaBtn, styles.playBtn])}>
      <CaretRightOutlined className={styles.icon} />
    </div>
  </div>
)

export default PlayButton
