import React from 'react'
import {
  message, Avatar, Button, Result, Space,
} from 'antd'
import { AudioOutlined } from '@ant-design/icons'

const { I18n } = window

interface Props {
  onAllow(): void
  readOnly?: boolean
}

export const Permission: React.FC<Props> = ({ onAllow, readOnly }) => {
  const requestBrowserPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({
        audio: true,
      })
      onAllow()
    } catch (err) {
      message.info(
        I18n.t('assessments.audio_response.permission_denied_message'),
      )
    }
  }

  return (
    <Result
      status="info"
      icon={<Avatar icon={<AudioOutlined />} size="large" aria-hidden="true" />}
      extra={(
        <Space direction="vertical">
          {I18n.t('assessments.audio_response.permission_text')}
          <Button
            type="primary"
            onClick={requestBrowserPermission}
            disabled={readOnly}
          >
            {I18n.t('assessments.video_response.device')}
          </Button>
        </Space>

      )}
    />
  )
}
