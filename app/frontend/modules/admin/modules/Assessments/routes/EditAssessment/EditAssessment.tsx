import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useResources } from '~/hooks/useResources'
import { Assessment, AssessmentTR } from '~/modules/admin/modules/client/core/assessments'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import { EditForm } from './EditForm'

const { I18n } = window

export const EditAssessment: React.FC = () => {
  const { id } = useParams<{id: string}>()
  useEffect(() => {
    fetchSingle({ id })
  }, [id])

  const { fetchSingle, getResource, memberAction } = useResources<Assessment>('assessments', {
    responseType: AssessmentTR,
    apiConfig: {
      include: ['dimension', 'owner', 'project', 'linked_assessment'],
      include_resource_meta: ['permissions'],
      fields: { dimensions: ['name'], users: ['name'] },
    },
  })

  const assessment = getResource(id)
  if (!assessment) return null

  return (
    <>
      <Breadcrumb
        crumbs={[
          {
            link: () => '/administration',
            label: () => I18n.t('assessments.dashboard'),
          },
          {
            label: () => I18n.t('assessments.assessments'),
            link: () => '/administration/assessments',
          },
          {
            label: () => assessment.name,
          },
          {
            label: () => I18n.t('assessments.edit'),
          },
        ]}
      />
      <EditForm assessment={assessment} memberAction={memberAction} />
    </>
  )
}
