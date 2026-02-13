import React from 'react'
import { Drawer } from 'antd'

const { I18n } = window

export const TranscriptionDetailsDrawer: React.FC<{
  transcriptionText: string
  closeShowTranscription: () => void
  showTranscription: boolean
}> = ({ transcriptionText, closeShowTranscription, showTranscription }) => (
  <Drawer
    title={I18n.t('shared.transcriptions')}
    onClose={closeShowTranscription}
    placement="right"
    maskClosable
    closable
    open={showTranscription}
    destroyOnHidden
    width="50%"
  >
    <pre>
      {transcriptionText}
    </pre>
  </Drawer>
)
