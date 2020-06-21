import React from 'react'

interface Props {
  match: {
    params: {
      projectId: string,
      campaignId: string
    }
  }
}

const AssessmentsReports: React.FC<Props> = () => (
  <div>
    Assessments Reports
  </div>
)

export default AssessmentsReports
