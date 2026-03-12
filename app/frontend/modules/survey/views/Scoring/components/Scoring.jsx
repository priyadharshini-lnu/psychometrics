import _ from 'lodash'
import { useMemo } from 'react'
import {
  Collapse, Tag, Avatar, Typography, Space,
} from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import { RECODING, SCORING } from '~/modules/survey/constants/scoring'
import { Scorings } from '~/modules/survey/components/modules'
import {
  selectedFactor as selectedFactorSelector,
  factorsSelector,
} from '~/modules/survey/core/builder/factors/selectors'
import { AiScoringConfig } from '~/modules/survey/components/AiScoringConfig/index.tsx'
import { selectIndicator } from '~/modules/survey/core/builder/factors'
import { AIEditorIcon } from '~/glint/icons'

import styles from './Scoring.less'

const { I18n } = window

export default function Scoring ({ model, type, ...props }) {
  const module = model.moduleConfig
  const dispatch = useDispatch()
  const { scoreWithAIEnabled } = model.props || {}
  const selectedFactor = useSelector(
    ({ survey: { builder } }) => selectedFactorSelector(builder, builder.factors.current),
  )
  const allFactors = useSelector(
    ({ survey }) => factorsSelector(survey.builder.factors, survey.builder.assessment.factors),
  ) || []

  const scoring = props.scorings[model.id]
  scoring?.setEngine(model.type)

  const currentFactorHasIndicators = useMemo(
    () => selectedFactor?.sub_factor_ids && selectedFactor.sub_factor_ids.length > 0, [selectedFactor.id],
  )

  let content = currentFactorHasIndicators
    ? I18n.t('admin.scoring_supported_only_for_ai_questions') : I18n.t('admin.assessment_question_not_supported')

  if (scoreWithAIEnabled) {
    const currentFactorIndicators = currentFactorHasIndicators
      ? allFactors.filter(factor => selectedFactor.sub_factor_ids.includes(factor.id)) : []
    const factorsForAiScoring = currentFactorHasIndicators
      ? currentFactorIndicators
      : [selectedFactor]

    const collapseItems = factorsForAiScoring.map((indicator, index) => {
      const indicatorScoringForCurrentQuestion = indicator.scoring?.[model.id]
          || getIndicatorScoringBeforeInitialization(indicator.scoring, model.id)
      const indicatorHasAiConfig = indicatorScoringForCurrentQuestion
        && !_.isEmpty(indicatorScoringForCurrentQuestion.ai_scoring_config)
      const {
        name, description, score_min, score_max, what_to_look_for, score_definitions,
      } = indicator
      const minAndMaxDefined = score_min !== null && score_max !== null
      return ({
        styles: {
          header:
            {
              background: minAndMaxDefined && indicatorHasAiConfig ? 'var(--ant-primary-light-bg)' : '',
              alignItems: 'center',
            },
        },
        key: indicator.id,
        label: (
          <Space size={10} className="p-1" align="center">
            <Avatar
              style={{ backgroundColor: minAndMaxDefined && indicatorHasAiConfig ? 'var(--ant-success-color)' : '' }}
              size="small"
            >
              {index + 1}
            </Avatar>
            <div>
              <Space size={18}>
                <Typography.Title className="mb-0 mt-0" level={5}>{name}</Typography.Title>
                {minAndMaxDefined && (
                  <Tag
                    key="processing"
                    variant="filled"
                    styles={
                      {
                        root:
                        {
                          backgroundColor: indicatorHasAiConfig
                            ? 'var(--ant-primary-1)' : 'var(--ant-disabled-bg)',
                        },
                      }
                    }
                  >
                    {I18n.t('admin.range_min_max', { min: score_min, max: score_max })}
                  </Tag>
                )}
              </Space>
              {description && <p className="mb-0">{description}</p>}
            </div>
          </Space>
        ),
        children: (
          <AiScoringConfig
            selectedFactor={indicator}
            scoring={currentFactorHasIndicators ? null : scoring}
            minScore={score_min}
            maxScore={score_max}
            questionId={model.id}
            factorType="indicator"
            questionType={model.type}
            defaultPrompt={what_to_look_for || ''}
            scoreDefinitionsFromFactor={score_definitions || []}
          />
        ),
      })
    })
    content = (
      <Collapse
        expandIconPlacement="end"
        onChange={(key) => {
          if (currentFactorHasIndicators && key?.length) {
            dispatch(selectIndicator(parseInt(key[0], 10), model.id))
          }
        }}
        style={{ minWidth: '800px' }}
        accordion
        items={collapseItems}
      />
    )
  } else if (
    module.scoring
    && !_.includes(module.scoringFilteredModules, model.props.type)
    && !currentFactorHasIndicators
  ) {
    content = <ScoringType model={model} type={type} {...props} />
  }

  return (
    <div className={styles.questionContainer}>
      <Space className={styles.infobar}>
        <Typography.Title className="mb-0" level={4}>{model.name}</Typography.Title>
        {scoreWithAIEnabled && (
          <Tag
            color="processing"
            icon={<AIEditorIcon />}
            styles={
              {
                icon: {
                  verticalAlign: 'top',
                },
              }
            }
          >
            {I18n.t('admin.ai_scored')}
          </Tag>
        )}
      </Space>
      {content}
    </div>
  )
}

const ScoringType = ({
  scorings, recoding, model, type,
}) => {
  const getScoring = () => {
    if (type === SCORING) {
      return scorings[model.id]
    }
    if (type === RECODING) {
      return recoding.find(q => q.question_id === model.id)
    }
  }
  const scoring = getScoring()
  if (!scoring) { return null }
  scoring.setEngine(model.type)
  const View = Scorings[`${model.type}Scoring`] || Scorings.MultipleChoiceScoring
  return (
    <div>
      {(model.id && <View model={model} scoring={scoring} />) || (
        <div>{I18n.t('admin.save_assessment_for_scoring_management')}</div>
      )}
    </div>
  )
}

const getIndicatorScoringBeforeInitialization = (scoring, questionId) => {
  if (!scoring || !questionId) {
    return null
  }

  return _.find(scoring, scoring => scoring.question_id === questionId)
}
