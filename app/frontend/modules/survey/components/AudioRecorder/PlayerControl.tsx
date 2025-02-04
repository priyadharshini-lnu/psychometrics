import React from 'react'
import { Button, Progress, Space } from 'antd'

import { UPLOAD_STATES } from '~/modules/survey/constants/media'

const { I18n } = window

interface Props {
  percent: number
  uploadState: string
  discardRecording(): void
  saveRecording(): void
  readOnly?: boolean
}

export const PlayerControl: React.FC<Props> = ({
  percent,
  uploadState,
  discardRecording,
  saveRecording,
  readOnly,
}) => (
  <Space>
    {!readOnly && (
      <Button type="primary" danger onClick={discardRecording}>
        {I18n.t('assessments.video_response.discard')}
      </Button>
    )}

    {uploadState !== UPLOAD_STATES.SAVED && (
      <Button
        type="primary"
        onClick={saveRecording}
        disabled={uploadState === UPLOAD_STATES.SAVING}
      >
        {uploadState === UPLOAD_STATES.SAVING
          ? I18n.t('assessments.audio_response.saving')
          : I18n.t('assessments.video_response.save')}
      </Button>
    )}

    {uploadState === UPLOAD_STATES.SAVED && !readOnly && (
      <Button disabled>
        {I18n.t('assessments.audio_response.saved.label')}
      </Button>
    )}

    {(uploadState === UPLOAD_STATES.SAVING
      || uploadState === UPLOAD_STATES.SAVED) && (
      <Progress
        type="circle"
        percent={uploadState === UPLOAD_STATES.SAVED ? 100 : percent}
        width={32}
      />
    )}
  </Space>
)
