import React, { useEffect } from 'react'
import Assessment from 'modules/admin/modules/campaigns/interfaces/Assessment'
import AgileUserAssessment from 'modules/user/modules/campaigns/routes/AgileUserAssessment'
import { PropsFromRedux } from './connect'
import CommonAssessment from './Assessments/Common'

interface OwnProps {
  anonym: {
    loaded: boolean
    error: boolean
    assessment: Assessment
  }
  match: { params: {assessmentKey: string}}
}

type Props = PropsFromRedux & OwnProps

const Anonym: React.FC<Props> = ({
  anonym: {
    loaded, error, assessment, results: { agileUserAssessmentUrl },
  },
  fetchResult,
  match: { params },
}) => {
  useEffect(() => {
    fetchResult(params.assessmentKey)
  }, [])

  if (!loaded || error) { return null }

  return assessment.category === 'agile'
    ? <AgileUserAssessment agileUserAssessmentUrl={agileUserAssessmentUrl} />
    : <CommonAssessment />
}

export default Anonym
