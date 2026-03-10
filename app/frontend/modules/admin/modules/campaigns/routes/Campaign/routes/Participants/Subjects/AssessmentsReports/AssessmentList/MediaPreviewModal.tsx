import { FC } from 'react'
import { Modal } from 'antd'
import styles from '../styles.less'

const { I18n } = window

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
}

const MediaPreviewModal: FC<Props> = ({
  open,
  onClose,
  mediaUrl,
  mediaResponse,
}) => (
  <Modal
    open={open}
    onCancel={onClose}
    footer={null}
    width={800}
    title={mediaResponse && (
      <div>
        <div>
          {`${I18n.t(`shared.${mediaResponse.questionType}`)} - `}
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
    {mediaUrl && mediaResponse?.questionType === 'video' && (
      <video
        src={mediaUrl}
        controls
        controlsList="nodownload"
        style={{ width: '100%' }}
        onContextMenu={e => e.preventDefault()}
      />
    )}
    {mediaUrl && mediaResponse?.questionType === 'audio' && (
      <audio
        src={mediaUrl}
        controls
        controlsList="nodownload"
        style={{ width: '100%' }}
      />
    )}
  </Modal>
)

export default MediaPreviewModal
