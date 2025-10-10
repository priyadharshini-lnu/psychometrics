import React from 'react'
import { useParams } from 'react-router-dom'
import { ReflectionQuestionTR } from '~/modules/admin/modules/client/core/reflectionQuestion'

import Modals from '~/modules/admin/components/Modals'
import { Resource } from '~/modules/admin/components/Resource'
import { ReflectionQuestionTable } from './Table'
import { FormModal } from './FormModal'
import { ImportModal } from './ImportModal'
import { ReflectionQuestionsFilter } from './Filter'

const MODALS = {
  FormModal,
  ImportModal,
}

export const ReflectionQuestions: React.FC = () => {
  const { projectId } = useParams() as { projectId: string }

  let projectIdFilter
  if (projectId) {
    projectIdFilter = {
      project_id_eq: projectId,
    }
  }

  const config = {
    trackUrl: true,
    responseType: ReflectionQuestionTR,
    basePath: `projects/${projectId}/`,
    apiConfig: {
      include_meta: ['permissions'],
      include_resource_meta: ['permissions'],
      filter: projectIdFilter,
    },
  }


  return (
    <Resource config={config} name="reflection_questions">
      <ReflectionQuestionsFilter />
      <ReflectionQuestionTable />
      <Modals modals={MODALS} />
    </Resource>
  )
}
