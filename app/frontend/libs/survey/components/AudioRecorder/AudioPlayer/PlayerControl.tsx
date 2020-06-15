import React from 'react'
import { Progress } from 'antd'
import { CheckOutlined, DeleteOutlined } from '@ant-design/icons'
import ColoredButton from 'components/ColoredButton'
import { I18n } from 'libs/survey/store/StoreWatchman'
import styles from '../AudioRecorderStyle.scss'
import MediaButtons from '../MediaButtons'
import { UPLOAD_STATES, PLAYER_STATE } from '../constants'

interface Props {
  playerState: string
  percent: number
  uploadState: string
  discardRecording(): void
  saveRecording(): void
  playAudio(): void
  pauseAudio(): void
  readOnly?: boolean
}

const PlayerControl: React.FC<Props> = ({
  playerState, percent, uploadState, discardRecording, saveRecording, playAudio, pauseAudio, readOnly,
}) => (
  <div className={styles.controls}>
    {!readOnly && (
    <ColoredButton
      color="grey"
      type="primary"
      icon={<DeleteOutlined />}
      className={styles.deleteBtn}
      onClick={discardRecording}
    >
      {I18n().t('assessments.video_response.delete')}
    </ColoredButton>
    )}

    {playerState === PLAYER_STATE.PLAYING && <MediaButtons.PauseButton onClick={pauseAudio} />}
    {playerState === PLAYER_STATE.PAUSED && <MediaButtons.PlayButton onClick={playAudio} />}

    {uploadState !== UPLOAD_STATES.SAVED
        && (
          <ColoredButton
            color="green"
            type="primary"
            icon={<CheckOutlined />}
            className={styles.saveBtn}
            onClick={saveRecording}
            disabled={uploadState === UPLOAD_STATES.SAVING}
          >
            {uploadState === UPLOAD_STATES.SAVING ? I18n().t('assessments.video_response.saving')
              : I18n().t('assessments.video_response.save')}
          </ColoredButton>
        )}

    {uploadState === UPLOAD_STATES.SAVED && !readOnly && (
    <div className={styles.savedTextContainer}>
      <CheckOutlined className={styles.icon} />
      <span className={styles.savedText}>{I18n().t('assessments.video_response.saved')}</span>
    </div>
    )}

    {uploadState === UPLOAD_STATES.SAVING && (
    <Progress
      type="circle"
      percent={percent}
      width={32}
      className="mls"
    />
    )}
  </div>
)

export default PlayerControl
