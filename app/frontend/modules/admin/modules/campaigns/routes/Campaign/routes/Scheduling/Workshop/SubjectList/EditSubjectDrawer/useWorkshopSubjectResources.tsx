import { useResources } from '~/hooks/useResources'
import {
  EditableWorkshopSubject,
  SubjectUserAssessment,
  AssessorUserAssessment,
} from '~/modules/admin/modules/campaigns/core/workshopSubject'

export const useWorkshopSubjectResources = (campaignId:string, id:string, subjectId:string, userId:string) => {
  const { fetchSingle: fetchSubject, getResource, isLoading } = useResources<EditableWorkshopSubject>(
    'workshop_subjects',
    {
      basePath: `campaigns/${campaignId}/workshops/${id}/`,
      apiConfig: {
        include: ['user', 'workshop'],
        include_resource_meta: ['assessor_assessments', 'assessors'],
      },
    },
  )
  const workshopSubjectDetailsLoading = isLoading(`fetch@${subjectId}`)
  const workshopSubject = getResource(subjectId)

  const {
    memberAction: updateSubject,
  } = useResources<EditableWorkshopSubject>(
    'workshop_subjects',
    {
      basePath: `campaigns/${campaignId}/`,
    },
  )


  const { data: subjecUserAssessments, fetch: fetchAssessments } = useResources<SubjectUserAssessment>(
    'user_assessments',
    {
      basePath: `campaigns/${campaignId}/workshop_subjects/${subjectId}/`,
      apiConfig: {
        filter: {
          subject_id_eq: userId,
          campaign_id_eq: campaignId,
          preworks: 'false',
          workshop_activities: 'true',
        },
      },
    },
  )

  const { collectionAction: fetchAssessorAssessments } = useResources<AssessorUserAssessment>(
    'campaign_assessor_assessments',
    {
      basePath: `campaigns/${campaignId}/workshop_subjects/${subjectId}/`,
      apiConfig: {
        filter: {
          subject_id_eq: subjectId,
        },
      },
    },
  )

  return {
    fetchSubject,
    workshopSubjectDetailsLoading,
    workshopSubject,
    subjecUserAssessments,
    fetchAssessments,
    fetchAssessorAssessments,
    updateSubject,
  }
}
