import { FC, useState } from 'react'
import {
  Checkbox, Tooltip, Button, Space,
} from 'antd'
import { EditOutlined, InfoCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { ModelAnswerModal } from './ModelAnswerModal'
import {
  TRASCRIPTION_ENABLED_QUESTIONS,
  AI_SCORING_ENABLED_QUESTIONS, ENHANCE_WITH_AI_ENABLED_QUESTIONS,
} from '~/modules/survey/constants/scoring.js'

const { I18n } = window

const { enhance_with_ai_enabled } = window.PsyGlobalState.features

interface Props {
  model,
  update: () => void,
}

export const ScoringProperties: FC<Props> = ({ model }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const showTranscriptionOption = TRASCRIPTION_ENABLED_QUESTIONS[model.type]
  let showAiScoringOption = AI_SCORING_ENABLED_QUESTIONS[model.type]
  let showEnhanceWithAiOption = false
  if (model.type === 'TextEntry') {
    showAiScoringOption = AI_SCORING_ENABLED_QUESTIONS[model.type][model.props.type]
    showEnhanceWithAiOption = enhance_with_ai_enabled && ENHANCE_WITH_AI_ENABLED_QUESTIONS[model.type][model.props.type]
  }
  const {
    props: {
      scoreWithAIEnabled, aiScoringModelAnswer, aiScoringKeywords, enableTranscription, enhanceWithAIEnabled = true,
    },
  } = model
  const aiScoringNeedsTranscription = showTranscriptionOption && !enableTranscription


  const handleEnableCheckbox = (key) => {
    const changedProps: { [key: string]: boolean } = { [key]: !model.props[key] }
    if (key === 'enableTranscription' && !changedProps[key]) {
      changedProps.scoreWithAIEnabled = false
    }
    model.changeProps(changedProps)
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
  }

  if (!showAiScoringOption && !showTranscriptionOption && !showEnhanceWithAiOption) {
    return null
  }


  return (
    <section className="m-4">

      {showTranscriptionOption && (
        <Checkbox
          className="font-normal"
          onChange={() => handleEnableCheckbox('enableTranscription')}
          defaultChecked={enableTranscription}
        >
          {I18n.t('admin.enable_transcription')}
        </Checkbox>
      )}
      <Space align="center" size={0}>
        <Checkbox
          disabled={aiScoringNeedsTranscription}
          className="font-normal"
          checked={scoreWithAIEnabled}
          onChange={() => handleEnableCheckbox('scoreWithAIEnabled')}
        >
          {I18n.t('admin.score_with_ai')}
          {aiScoringNeedsTranscription && (
            <Tooltip title={I18n.t('admin.enable_transcription_msg')}>
              <span><InfoCircleOutlined className="ms-2" /></span>
            </Tooltip>
          )}
        </Checkbox>

        {scoreWithAIEnabled && (
          <Button
            type="link"
            icon={<EditOutlined title={I18n.t('admin.model_answer')} className="me-2" />}
            onClick={handleOpenModal}
          />
        )}
      </Space>

      {showEnhanceWithAiOption && (
        <Checkbox
          className="font-normal"
          checked={enhanceWithAIEnabled}
          onChange={() => handleEnableCheckbox('enhanceWithAIEnabled')}
        >
          {I18n.t('admin.enhance_with_ai')}
        </Checkbox>
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
