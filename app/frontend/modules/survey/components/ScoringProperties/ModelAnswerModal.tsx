import { FC, useState, useEffect } from 'react'
import {
  Modal, Input, Typography,
} from 'antd'

const { I18n } = window
const { TextArea } = Input

interface Props {
  open: boolean
  modelAnswer: string
  keywords: string
  onClose: () => void
  onSave: (modelAnswer: string, keywords: string) => void
}

export const ModelAnswerModal: FC<Props> = ({
  open,
  modelAnswer,
  keywords,
  onClose,
  onSave,
}) => {
  const [localModelAnswer, setLocalModelAnswer] = useState(modelAnswer)
  const [localKeywords, setLocalKeywords] = useState(keywords)

  useEffect(() => {
    if (open) {
      setLocalModelAnswer(modelAnswer)
      setLocalKeywords(keywords)
    }
  }, [open, modelAnswer, keywords])

  const handleOk = () => {
    onSave(localModelAnswer, localKeywords)
    onClose()
  }

  return (
    <Modal
      open={open}
      title={<Typography.Title level={4}>{I18n.t('admin.configure_model_answer_title')}</Typography.Title>}
      onCancel={onClose}
      onOk={handleOk}
      okText={I18n.t('shared.save')}
      cancelText={I18n.t('shared.cancel')}
      width={600}
    >
      <Typography.Title level={5}>{I18n.t('admin.model_answer')}</Typography.Title>
      <TextArea
        className="mb-4"
        rows={4}
        value={localModelAnswer}
        onChange={e => setLocalModelAnswer(e.target.value)}
        placeholder={I18n.t('admin.model_answer_placeholder')}
      />
      <Typography.Title level={5} className="mt-4">{I18n.t('admin.keywords')}</Typography.Title>
      <TextArea
        rows={4}
        value={localKeywords}
        onChange={e => setLocalKeywords(e.target.value)}
        placeholder={I18n.t('admin.keywords_placeholder')}
      />
    </Modal>
  )
}

export default ModelAnswerModal
