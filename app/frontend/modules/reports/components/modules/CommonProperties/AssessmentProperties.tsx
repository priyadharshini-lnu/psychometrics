import React from 'react'
import Select from 'react-select'
import { Typography } from 'antd'

import AppStore from '~/modules/reports/store/AppStore'

interface Props {
  assessmentId: number
  changeAssessment: (assessmentId: number) => void
}

const AssessmentProperties: React.FC<Props> = ({
  assessmentId,
  changeAssessment,
}) => {
  const assessmentOptions = AppStore.assessments.map(assessment => ({
    label: assessment.name,
    value: assessment.id,
  }))

  const selectedValue = assessmentOptions.find(opt => opt.value === assessmentId)

  return (
    <div>
      <Typography.Text>Assessment</Typography.Text>
      <Select
        options={assessmentOptions}
        value={selectedValue}
        onChange={option => option && changeAssessment(option.value)}
        isClearable={false}
      />
    </div>
  )
}

export default AssessmentProperties
