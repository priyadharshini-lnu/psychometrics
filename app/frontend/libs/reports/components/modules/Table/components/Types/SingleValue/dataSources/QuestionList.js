import _ from 'lodash'
import Select from 'react-select'
import React from 'react'
import store from 'rb/store/PropertyPanelStore'
import AssessmentStore from 'rb/store/AssessmentStore'
import { getValue } from 'rb/presenters/ReactSelectPresenter'

const AVAILABLE_QUESTION_TYPES = ['MatrixTable', 'SideBySide']

export default function QuestionList ({ model, onChange }) {
  const findQuestion = id => _.find(AssessmentStore.questions[model.assessment_id], question => question.id === id)

  const onChangeQuestion = ({ id }) => {
    onChange('questionId', id)
    if (id) {
      const question = findQuestion(id)
      onChange('questionChoiceIds', _.times(question.props.choices, i => i))
    }
  }

  const questions = _.filter(
    AssessmentStore.questions[model.assessment_id] || [], q => AVAILABLE_QUESTION_TYPES.includes(q.type),
  )

  const question = findQuestion(model.props.questionId)

  const getChoices = () => (question.props.choicesTexts || []).map((choice, index) => ({
    label: _.truncate(choice, { length: 25 }),
    value: index,
  }))

  return (
    <div>
      <div className="mtm">
        Question
        <Select
          value={getValue(questions, store.model.props.questionId)}
          options={questions}
          getOptionValue={opt => opt.id}
          getOptionLabel={opt => opt.name}
          autoFocus={false}
          isClearable={false}
          onChange={onChangeQuestion}
          placeholder="All Responses"
        />
      </div>
      {question && (
        <div className="mtm">
          Question Choices
          <Select
            value={getValue(getChoices(), store.model.props.questionChoiceIds)}
            options={getChoices()}
            getOptionValue={opt => opt.value}
            isClearable={false}
            isMulti
            onChange={choices => onChange('questionChoiceIds', choices.map(ch => ch.value))}
            placeholder="All Responses"
          />
        </div>
      )}
    </div>
  )
}
