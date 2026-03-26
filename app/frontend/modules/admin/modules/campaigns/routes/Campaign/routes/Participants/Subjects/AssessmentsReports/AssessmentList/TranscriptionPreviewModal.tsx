import { FC } from 'react'
import { Modal, Button, message } from 'antd'
import { CopyOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import styles from '../styles.less'

const { I18n } = window

interface MediaResponse {
  questionId: number
  questionText: string | null
}

interface Props {
  open: boolean
  onClose: () => void
  transcriptionText: string
  mediaResponse: MediaResponse | null
}

const TranscriptionPreviewModal: FC<Props> = ({
  open,
  onClose,
  transcriptionText,
  mediaResponse,
}) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcriptionText)
    message.success(I18n.t('shared.copied_to_clipboard'))
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={(
        <Button
          icon={<CopyOutlined />}
          onClick={copyToClipboard}
        >
          {I18n.t('shared.copy')}
        </Button>
      )}
      width={700}
      title={mediaResponse && (
        <div>
          <div>
            {`${I18n.t('shared.transcription')} - `}
            {`${I18n.t('shared.question_id')}: ${mediaResponse.questionId}`}
          </div>
          {mediaResponse.questionText && (
            <div className={styles.modalQuestionSubtitle}>
              {mediaResponse.questionText}
            </div>
          )}
        </div>
      )}
      destroyOnHidden
    >
      <pre style={{ whiteSpace: 'pre-wrap', maxHeight: 400, overflow: 'auto' }}>
        {transcriptionText || "''"}
      </pre>
    </Modal>
  )
}

export default TranscriptionPreviewModal
