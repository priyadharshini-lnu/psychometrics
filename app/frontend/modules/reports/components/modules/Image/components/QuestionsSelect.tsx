import filter from 'lodash/filter'
import React from 'react'
import { Select } from 'antd'
import AssessmentProperties from '~/modules/reports/components/modules/CommonProperties/AssessmentProperties'
import panelStyles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'

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

  const getQuestions = () => filter(questions, q => q.type === 'FileUpload')
    .map(q => ({ label: q.name, value: q.id }))

  const changeAssessment = (assessmentId) => {
    model.assessment_id = assessmentId
    select()
  }

  const changeSourceQuestion = (value: number) => {
    model.props.sourceQuestion = value
    select()
  }

  return (
    <div>
      <hr className={panelStyles.divider} />
      <div>
        <AssessmentProperties assessmentId={model.assessment_id} changeAssessment={changeAssessment} />
        <span>Question</span>
        <Select
          style={{ width: '100%' }}
          value={model.props.sourceQuestion}
          options={getQuestions()}
          allowClear={false}
          autoFocus={false}
          onChange={changeSourceQuestion}
        />
      </div>
    </div>
  )
}

export default QuestionSelect
