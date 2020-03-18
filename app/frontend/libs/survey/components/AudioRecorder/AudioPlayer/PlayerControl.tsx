import React from 'react'
import { Progress } from 'antd'
import { CheckOutlined, DeleteOutlined } from '@ant-design/icons'
import ColoredButton from 'components/ColoredButton'
import styles from '../AudioRecorderStyle.scss'
import MediaButtons from '../MediaButtons'
import { UPLOAD_STATES, PLAYER_STATE } from '../constants'
import ButtonColor from 'constants/buttonColor'

interface Props {
  playerState: string
  percent: number
  uploadState: string
  discardRecording():void
  saveRecording():void
  playAudio():void
  pauseAudio():void
}

const PlayerControl: React.FC<Props> = ({ playerState, percent, uploadState, discardRecording, saveRecording, playAudio, pauseAudio }) => {
  return (
    <div className={styles.controls}>
      <ColoredButton
        color={ButtonColor.GREY}
        type="primary"
        icon={<DeleteOutlined />}
        className={styles.deleteBtn}
        onClick={discardRecording}
      >
        Delete
      </ColoredButton>

      {playerState === PLAYER_STATE.PLAYING && <MediaButtons.PauseButton onClick={pauseAudio} />}
      {playerState === PLAYER_STATE.PAUSED && <MediaButtons.PlayButton onClick={playAudio} />}

      {uploadState !== UPLOAD_STATES.SAVED
        && (
          <ColoredButton
            color={ButtonColor.GREEN}
            type="primary"
            icon={<CheckOutlined />}
            className={styles.saveBtn}
            onClick={saveRecording}
            disabled={uploadState === UPLOAD_STATES.SAVING}
          >
            {uploadState === UPLOAD_STATES.SAVING ? 'Saving' : 'Save'}
          </ColoredButton>
        )}

      {uploadState === UPLOAD_STATES.SAVED && (
        <div className={styles.savedTextContainer}>
          <CheckOutlined className={styles.icon} />
          <span className={styles.savedText}>Saved</span>
        </div>
      )}

      {uploadState === UPLOAD_STATES.SAVING && (
        <Progress
          type="circle"
          percent={percent}
          width={32}
          className='mls'
        />
      )}
    </div>
  )
}

export default PlayerControl
