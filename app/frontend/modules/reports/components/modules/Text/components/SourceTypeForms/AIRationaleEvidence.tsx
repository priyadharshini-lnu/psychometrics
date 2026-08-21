import React from 'react'
import Select from 'react-select'
import _ from 'lodash'
import { getValue } from '~/modules/reports/presenters/ReactSelectPresenter'
import * as QuestionPresenter from '~/modules/reports/presenters/QuestionPresenter'
import AppStore from '~/modules/reports/store/AppStore'

const { I18n } = window

const ALL_FACTORS_VALUE = '__all__'

interface Question {
  id: number
  name: string
  type: string
  props?: { scoreWithAIEnabled?: boolean | string; [key: string]: unknown }
}

interface Factor {
  id: number
  alias: string
  question_ids?: number[]
}

interface Module {
  assessment_id?: number
  props: {
    question?: number
    selectedFactors?: number[]
    [key: string]: unknown
  }
}

interface Props {
  model: Module
  onChangeModelIn: (keys: string[], value: unknown) => void
  questions: Record<number, Question>
}

const AIRationaleEvidence: React.FC<Props> = ({ model, onChangeModelIn, questions }) => {
  const onChangeQuestion = ({ value }: { value: number }) => {
    onChangeModelIn(['props', 'question'], value)
    onChangeModelIn(['props', 'selectedFactors'], [])
  }

  const onChangeFactors = (selected: readonly { value: number | string; label: string }[]) => {
    if (!selected || selected.length === 0) {
      onChangeModelIn(['props', 'selectedFactors'], [])
      return
    }

    if (selected.some(opt => opt.value === ALL_FACTORS_VALUE)) {
      onChangeModelIn(['props', 'selectedFactors'], [])
      return
    }

    onChangeModelIn(['props', 'selectedFactors'], selected.map(opt => opt.value))
  }

  const getQuestionOptions = () => {
    const filteredQuestions = _.filter(
      questions,
      (q: Question) => q.props?.scoreWithAIEnabled === true || q.props?.scoreWithAIEnabled === 'true',
    )
    return filteredQuestions.map((question: Question) => ({
      label: QuestionPresenter.getName(question),
      value: question.id,
    }))
  }

  const getFactorOptions = (): Array<{ value: number | string; label: string }> => {
    const assessmentId = model.assessment_id
    const assessment = _.find(AppStore.assessments, { id: assessmentId })
    if (!assessment) return []

    const { dimensionId } = assessment as { dimensionId: number }
    if (!dimensionId) return []
    const allFactors: Factor[] = AppStore.factors[dimensionId] || []

    const questionId = model.props.question
    const factors = questionId
      ? allFactors.filter(f => f.question_ids && f.question_ids.includes(questionId))
      : allFactors

    const options: Array<{ value: number | string; label: string }> = [
      { value: ALL_FACTORS_VALUE, label: I18n.t('shared.reports.ai_rationale_evidence.all_factors') },
    ]
    factors.forEach((f) => {
      options.push({ value: f.id, label: f.alias })
    })
    return options
  }

  const questionOptions = getQuestionOptions()
  const factorOptions = getFactorOptions()

  const selectedFactors = model.props.selectedFactors || []
  const factorValue = selectedFactors.length > 0
    ? factorOptions.filter(opt => selectedFactors.includes(opt.value as number))
    : []

  return (
    <div style={{ marginTop: '10px' }}>
      <div>{I18n.t('shared.reports.ai_rationale_evidence.question_label')}</div>
      <Select
        name="ai-rationale-question"
        value={getValue(questionOptions, model.props.question)}
        isClearable={false}
        options={questionOptions}
        getOptionValue={opt => opt.value}
        onChange={onChangeQuestion}
        placeholder={I18n.t('shared.reports.ai_rationale_evidence.select_question')}
      />

      <div style={{ marginTop: '10px' }}>
        <div>{I18n.t('shared.reports.ai_rationale_evidence.factor_label')}</div>
        <Select
          name="ai-rationale-factors"
          value={factorValue}
          isMulti
          isClearable
          options={factorOptions}
          getOptionValue={opt => String(opt.value)}
          onChange={onChangeFactors}
          placeholder={I18n.t('shared.reports.ai_rationale_evidence.all_factors')}
        />
      </div>
    </div>
  )
}

export default AIRationaleEvidence
