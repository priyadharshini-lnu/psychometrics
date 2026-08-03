import React from 'react'
import Select from 'react-select'
import _ from 'lodash'
import { getValue } from '~/modules/reports/presenters/ReactSelectPresenter'
import * as QuestionPresenter from '~/modules/reports/presenters/QuestionPresenter'

const { I18n } = window

const MEDIA_QUESTION_TYPES = ['AudioResponse', 'VideoResponse']

interface Question {
  id: number
  name: string
  type: string
  props?: { enableTranscription?: boolean | string; [key: string]: unknown }
}

interface Module {
  props: {
    question?: number
    [key: string]: unknown
  }
}

interface Props {
  model: Module
  onChangeModelIn: (keys: string[], value: unknown) => void
  questions: Record<number, Question>
}

const AITranscript: React.FC<Props> = ({ model, onChangeModelIn, questions }) => {
  const onChangeQuestion = ({ value }: { value: number }) => {
    onChangeModelIn(['props', 'question'], value)
  }

  const getQuestionOptions = () => {
    const filteredQuestions = _.filter(
      questions,
      (q: Question) => MEDIA_QUESTION_TYPES.includes(q.type)
        && (q.props?.enableTranscription === true || q.props?.enableTranscription === 'true'),
    )
    return filteredQuestions.map((question: Question) => ({
      label: QuestionPresenter.getName(question),
      value: question.id,
    }))
  }

  const questionOptions = getQuestionOptions()

  return (
    <div style={{ marginTop: '10px' }}>
      <div>{I18n.t('shared.reports.ai_transcript.question_label')}</div>
      <Select
        name="ai-transcript-question"
        value={getValue(questionOptions, model.props.question)}
        isClearable={false}
        options={questionOptions}
        getOptionValue={opt => opt.value}
        onChange={onChangeQuestion}
        placeholder={I18n.t('shared.reports.ai_transcript.select_question')}
      />
    </div>
  )
}

export default AITranscript
