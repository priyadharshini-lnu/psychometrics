import _ from 'lodash'
import { ExternalAssessment } from '~/modules/admin/modules/client/core/externalAssessments'
import { ExternalSettings } from '~/modules/admin/modules/client/core/assessments'

export const getAllExternalAssessments = (
  searchedExternalAssessments: ExternalAssessment[], externalSettings: ExternalSettings | undefined,
) => {
  let allExternalAssessments = searchedExternalAssessments
  if (externalSettings?.assessmentName && externalSettings?.assessmentId) {
    allExternalAssessments = allExternalAssessments.concat(
      { name: externalSettings.assessmentName, id: externalSettings.assessmentId },
    )
    allExternalAssessments = _.uniqBy(allExternalAssessments, 'id')
  }
  return allExternalAssessments
}
