import { useState } from 'react'
import { useSelector } from 'react-redux'
import _ from 'lodash'
import {
  Space, Typography, Alert,
} from 'antd'
import { FillScoringButton } from '~/modules/survey/components/FillScoringButton'
import { ArrowsAltOutlined, ShrinkOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { ScoringPromopt } from './ScoringPromopt'
import { AI_SCORE_CONFIG_TYPES } from '~/modules/survey/constants/scoring.js'
import { factorScoring } from '~/modules/survey/core/builder/factors/selectors'
import { RootState } from '~/modules/survey/core/rootReducers'
import Scoring, { type ScoreDefinition } from '~/modules/survey/models/Scoring'

const { I18n } = window

type AiScoringConfigProps = {
  minScore: number
  maxScore: number
  questionId: number
  scoring: {
    ai_scoring_config?: Record<string, string>
  } & Scoring
  factorType: 'regular' | 'indicator'
  questionType: string
  selectedFactor: {
    id: number
  }
  defaultPrompt: string
  scoreDefinitionsFromFactor: Array<ScoreDefinition>
}

export const AiScoringConfig: React.FC<AiScoringConfigProps> = ({
  minScore, maxScore, scoring, questionId, factorType, selectedFactor,
  questionType, defaultPrompt, scoreDefinitionsFromFactor = [],
}) => {
  const indicatorScorings = useSelector(
    (state: RootState) => factorScoring(state.survey.builder, selectedFactor?.id),
  )
  let scoringModel: Scoring = scoring
  if (factorType === 'indicator') {
    scoringModel = indicatorScorings[questionId]
    scoringModel?.setEngine(questionType)
  }
  const optionalScoreRange = _.range(minScore + 1, maxScore)
  const [showOptionalScores, setShowOptionalScores] = useState<boolean>(false)
  const { ai_scoring_config: aiScoringConfig } = scoringModel || {}
  const disableScoring = !aiScoringConfig || _.isEmpty(aiScoringConfig)

  const handleChangeAiScoringConfig = (...args) => {
    scoringModel.changeAiScoringConfig(...args)
  }

  const handleFillOrRemoveAiConfig = () => {
    disableScoring ? scoringModel.initializeAiScoringConfig(
      { what_to_look_for: defaultPrompt, score_definitions: [...scoreDefinitionsFromFactor] },
    ) : scoringModel.removeAiScoringConfig()
  }

  if (!minScore || !maxScore) {
    return (
      <Alert
        showIcon
        title={I18n.t('admin.set_min_max_scores_warning')}
        type="warning"
        banner
      />
    )
  }

  return (
    <Space orientation="vertical" className="w-100">
      <FillScoringButton hasScore={!disableScoring} onClick={handleFillOrRemoveAiConfig} />
      <ScoringPromopt
        initialPrompt={aiScoringConfig?.[AI_SCORE_CONFIG_TYPES.WHAT_TO_LOOK_FOR] || ''}
        title={<Typography.Title level={5}>{I18n.t('admin.what_to_look_for')}</Typography.Title>}
        onPromptChange={(value: string) => {
          handleChangeAiScoringConfig(AI_SCORE_CONFIG_TYPES.WHAT_TO_LOOK_FOR, undefined, value)
        }}
        disableScoring={disableScoring}
        required
        rows={4}
      />
      <Space orientation="vertical" style={{ minWidth: '800px' }} className="w-100 mt-10">
        <ScoringPromopt
          initialPrompt={getScoreLevelPromptDefinition(
            aiScoringConfig, minScore,
          )}
          title={<Typography.Text strong>{I18n.t('admin.define_min_score_text', { minScore })}</Typography.Text>}
          onPromptChange={(value: string) => {
            handleChangeAiScoringConfig(AI_SCORE_CONFIG_TYPES.SCORE_DEFINITIONS, minScore, value)
          }}
          disableScoring={disableScoring}
          required
        />
        <span>
          <Typography.Link onClick={() => setShowOptionalScores(!showOptionalScores)}>
            {showOptionalScores
              ? <ShrinkOutlined rotate={-45} /> : <ArrowsAltOutlined rotate={-45} /> }
            {I18n.t('admin.define_optional_score_range_text', { minScore: minScore + 1, maxScore: maxScore - 1 })}
          </Typography.Link>
        </span>
        {showOptionalScores && (
          <Space orientation="vertical" className="w-100">
            {optionalScoreRange.map(score => (
              <ScoringPromopt
                key={`scoring-prompt-${questionId}-${score}`}
                initialPrompt={getScoreLevelPromptDefinition(
                  aiScoringConfig, score,
                )}
                title={I18n.t('admin.define_score_text', { score })}
                onPromptChange={(value: string) => {
                  handleChangeAiScoringConfig(AI_SCORE_CONFIG_TYPES.SCORE_DEFINITIONS, score, value)
                }}
                disableScoring={disableScoring}
              />
            ))}
          </Space>
        )}
        <ScoringPromopt
          initialPrompt={getScoreLevelPromptDefinition(
            aiScoringConfig, maxScore,
          )}
          title={<Typography.Text strong>{I18n.t('admin.define_max_score_text', { maxScore })}</Typography.Text>}
          onPromptChange={(value: string) => {
            handleChangeAiScoringConfig(AI_SCORE_CONFIG_TYPES.SCORE_DEFINITIONS, maxScore, value)
          }}
          disableScoring={disableScoring}
          required
        />
      </Space>
    </Space>
  )
}

const getScoreLevelPromptDefinition = (aiScoringConfig, index: number) => {
  if (!aiScoringConfig?.[AI_SCORE_CONFIG_TYPES.SCORE_DEFINITIONS]) {
    return ''
  }
  return aiScoringConfig[AI_SCORE_CONFIG_TYPES.SCORE_DEFINITIONS]
    .find((item => item.score.toString() === index.toString()))?.definition || ''
}
