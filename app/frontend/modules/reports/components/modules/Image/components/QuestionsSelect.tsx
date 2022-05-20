import _ from 'lodash'
import React from 'react'
import Select from 'react-select'
import AssessmentProperties from 'modules/reports/components/modules/CommonProperties/AssessmentProperties'
import panelStyles from 'modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import { getValue } from 'modules/reports/presenters/ReactSelectPresenter'

interface Question {
  id: number
  name: string
  type: string
}

interface Module {
  assessment_id: number
  props: {
    sourceQuestion: number
  }
}

interface Props {
  model: Module
  questions: Question[]
  onSelect: () => void
}

export const QuestionSelect: React.FC<Props> = ({ model, questions, onSelect }) => {
  const select = () => {
    onSelect()
  }

  const getQuestions = () => _.filter(questions, q => q.type === 'FileUpload')
    .map(q => ({ label: q.name, value: q.id }))

  const changeAssessment = (assessmentId) => {
    model.assessment_id = assessmentId
    select()
  }

  const changeSourceQuestion = (value) => {
    model.props.sourceQuestion = value.value
    select()
  }

  return (
    <div>
      <hr className={panelStyles.divider} />
      <div>
        <AssessmentProperties assessmentId={model.assessment_id} changeAssessment={changeAssessment} />
        <span>Question</span>
        <Select
          name="form-field-name"
          value={getValue(getQuestions(), _.result(model, 'props.sourceQuestion', 'Choose question'))}
          options={getQuestions()}
          isClearable={false}
          autoFocus={false}
          onChange={changeSourceQuestion}
        />
      </div>
    </div>
  )
}

export default QuestionSelect
