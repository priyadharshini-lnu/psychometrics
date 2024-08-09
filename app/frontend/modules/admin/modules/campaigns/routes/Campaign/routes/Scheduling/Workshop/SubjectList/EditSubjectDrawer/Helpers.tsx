import _ from 'lodash'
import {
  AssessorUserAssessment,
  CampaignAssessorAssessment,
} from '~/modules/admin/modules/campaigns/core/workshopSubject'
import { ASSESSMENT_SOURCE } from './Constants'

// This is done to identify the type of the assessor assessment,
// whether it is AssessorUserAssessment or the CampaignAssessorAssessment.
// So it's easier to identify while performing operations.
export const combineAssessments = (
  assessorUserAssessments: AssessorUserAssessment[] = [],
  campaignAssessorAssessments: CampaignAssessorAssessment[] = [],
): AssessorUserAssessment[] => {
  const assessorUserAssessmentsWithSource = assessorUserAssessments.map(item => (
    { ...item, source: ASSESSMENT_SOURCE.ASSESSOR_USER_ASSESSMENT }
  ))
  const campaignAssessorAssessmentWithSource = campaignAssessorAssessments.map(item => (
    { ...item, source: ASSESSMENT_SOURCE.CAMPAIGN_ASSESSOR_ASSESSMENTS }
  ))
  return [
    ...assessorUserAssessmentsWithSource,
    ..._.differenceBy(campaignAssessorAssessmentWithSource, assessorUserAssessmentsWithSource, 'assessmentId'),
  ]
}
