import { FC, useState } from 'react'
import { Checkbox, Divider, Typography } from 'antd'
import { EditOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { ModelAnswerModal } from './ModelAnswerModal'

const { I18n } = window

interface Props {
  model,
  update: () => void
}

export const ScoreWithAI: FC<Props> = ({ model, update }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleEnableCheckbox = () => {
    model.changeProps({
      scoreWithAIEnabled: !model.props.scoreWithAIEnabled,
    })
    update()
  }

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleSaveModelAnswer = (modelAnswer: string, keywords: string) => {
    model.changeProps({
      aiScoringModelAnswer: modelAnswer,
      aiScoringKeywords: keywords,
    })
    update()
  }

  const {
    props: { scoreWithAIEnabled, aiScoringModelAnswer, aiScoringKeywords },
  } = model

  return (
    <section className="ms-4 me-4 mb-4">
      <Divider />

      <Typography.Text strong>
        {I18n.t('admin.scoring')}
      </Typography.Text>

      <Checkbox
        className="mt-2"
        checked={scoreWithAIEnabled}
        onChange={handleEnableCheckbox}
      >
        {I18n.t('admin.score_with_ai')}
      </Checkbox>

      {scoreWithAIEnabled && (
        <div className="mt-2 ms-6">
          <Typography.Link onClick={handleOpenModal}>
            <EditOutlined className="me-2" />
            {I18n.t('admin.model_answer')}
          </Typography.Link>
        </div>
      )}

      <ModelAnswerModal
        open={isModalOpen}
        modelAnswer={aiScoringModelAnswer || ''}
        keywords={aiScoringKeywords || ''}
        onClose={handleCloseModal}
        onSave={handleSaveModelAnswer}
      />
    </section>
  )
}

export default ScoreWithAI
