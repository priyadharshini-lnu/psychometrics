import React from 'react'
import { Drawer } from 'antd'

const { I18n } = window

export const TranscriptionDetailsDrawer: React.FC<{
  transcriptionText: string
  closeShowTranscription: () => void
  showTranscription: boolean
  disableTranscriptDownload?: boolean
}> = ({
  transcriptionText,
  closeShowTranscription,
  showTranscription,
  disableTranscriptDownload,
}) => {
  const handleCopyContentEvents = (e: React.ClipboardEvent | React.MouseEvent) => {
    if (disableTranscriptDownload) {
      e.preventDefault()
    }
  }

  return (
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
      <pre
        style={{ userSelect: disableTranscriptDownload ? 'none' : 'auto' }}
        onCopy={handleCopyContentEvents}
        onCut={handleCopyContentEvents}
        onContextMenu={handleCopyContentEvents}
      >
        {transcriptionText}
      </pre>
    </Drawer>
  )
}
