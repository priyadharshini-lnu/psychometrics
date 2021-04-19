import React from 'react'
import { message } from 'antd'
import { AudioFilled, CheckOutlined } from '@ant-design/icons'
import cs from 'classnames'
import ColoredButton from 'components/ColoredButton/index'
import styles from './styles.scss'

const { I18n } = window

interface Props {
  onAllow(): void
  readOnly?: boolean
}

export const Permission: React.FC<Props> = ({ onAllow, readOnly }) => {
  const askForPermission = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(onAllow)
      .catch(() => {
        message.info(I18n.t('assessments.audio_response.permission_denied_message'))
      })
  }

  return (
    <div className={styles.permissionContainer}>
      <div className={styles.iconContainer}>
        <AudioFilled className={cs([styles.icon, 'mtl'])} />
      </div>
      <div className="mtl">{I18n.t('assessments.audio_response.permission_text')}</div>
      <ColoredButton
        color="green"
        type="primary"
        icon={<CheckOutlined />}
        className="mtl"
        onClick={askForPermission}
        disabled={readOnly}
      >
        {I18n.t('assessments.video_response.device')}
      </ColoredButton>
    </div>
  )
}
