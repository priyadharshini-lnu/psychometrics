import { FC, useState, useEffect } from 'react'
import { Modal, Divider, Typography } from 'antd'
import {
  EyeOutlined, EyeInvisibleOutlined, DownloadOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'

const { I18n } = window
const { Text, Link } = Typography

interface MediaResponse {
  questionId: number
  questionText: string | null
  questionType: string
}

interface Props {
  open: boolean
  onClose: () => void
  mediaUrl: string
  mediaResponse: MediaResponse | null
  transcriptionText?: string | null
  transcriptionEnabled?: boolean
  onDownloadTranscription?: () => void
}

const MediaPreviewModal: FC<Props> = ({
  open,
  onClose,
  mediaUrl,
  mediaResponse,
  transcriptionText,
  transcriptionEnabled,
  onDownloadTranscription,
}) => {
  const [showTranscription, setShowTranscription] = useState(false)
  const hasTranscription = transcriptionEnabled && transcriptionText

  useEffect(() => {
    if (!open) {
      setShowTranscription(false)
    }
  }, [open])

  const modalTitle = mediaResponse
    && `${I18n.t(`shared.${mediaResponse.questionType}`)} - ${I18n.t('shared.question_id')}:${mediaResponse.questionId}`

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      title={modalTitle}
      destroyOnHidden
    >
      {mediaResponse?.questionText && (
        <Text type="secondary">
          {mediaResponse.questionText}
        </Text>
      )}
      {mediaUrl && mediaResponse?.questionType === 'video' && (
        <video
          src={mediaUrl}
          controls
          controlsList="nodownload"
          style={{ width: '100%', maxHeight: '400px', marginTop: mediaResponse?.questionText ? 12 : 0 }}
          onContextMenu={e => e.preventDefault()}
        />
      )}
      {mediaUrl && mediaResponse?.questionType === 'audio' && (
        <audio
          src={mediaUrl}
          controls
          controlsList="nodownload"
          style={{ width: '100%', marginTop: mediaResponse?.questionText ? 12 : 0 }}
        />
      )}
      {hasTranscription && (
        <>
          <Divider style={{ margin: '12px 0' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text strong>
              {`${I18n.t('shared.transcription')}:`}
            </Text>
            <Link onClick={() => setShowTranscription(!showTranscription)}>
              {showTranscription ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              {' '}
              {I18n.t('shared.view')}
            </Link>
            <Text type="secondary">|</Text>
            <Link onClick={onDownloadTranscription}>
              <DownloadOutlined />
              {' '}
              {I18n.t('shared.download')}
            </Link>
          </div>
          {showTranscription && (
            <pre style={{
              whiteSpace: 'pre-wrap',
              maxHeight: 200,
              overflowY: 'scroll',
              width: '100%',
              margin: '12px 0 0 0',
              padding: 12,
              backgroundColor: '#f5f5f5',
              border: '1px solid #d9d9d9',
              borderRadius: 4,
            }}
            >
              {transcriptionText}
            </pre>
          )}
        </>
      )}
    </Modal>
  )
}

export default MediaPreviewModal
