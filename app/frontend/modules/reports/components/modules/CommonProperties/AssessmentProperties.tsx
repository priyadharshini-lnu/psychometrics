import React from 'react'
import { Select, Typography } from 'antd'

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

  return (
    <div>
      <Typography.Text>Assessment</Typography.Text>
      <Select
        className="w-100"
        size="small"
        options={assessmentOptions}
        value={assessmentId}
        onChange={value => changeAssessment(value)}
      />
    </div>
  )
}

export default AssessmentProperties
