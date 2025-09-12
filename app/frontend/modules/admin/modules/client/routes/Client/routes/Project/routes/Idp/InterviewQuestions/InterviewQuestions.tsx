import React from 'react'
import { useParams } from 'react-router-dom'
import { InterviewQuestionTR } from '~/modules/admin/modules/client/core/interviewQuestion'

import Modals from '~/modules/admin/components/Modals'
import { Resource } from '~/modules/admin/components/Resource'
import { InterviewQuestionTable } from './Table'
import { FormModal } from './FormModal'
import { ImportModal } from './ImportModal'
import { InterviewQuestionsFilter } from './Filter'

const MODALS = {
  FormModal,
  ImportModal,
}

export const InterviewQuestions: React.FC = () => {
  const { projectId } = useParams() as { projectId: string }

  let projectIdFilter
  if (projectId) {
    projectIdFilter = {
      project_id_eq: projectId,
    }
  }

  const config = {
    trackUrl: true,
    responseType: InterviewQuestionTR,
    basePath: `projects/${projectId}/`,
    apiConfig: {
      include_meta: ['permissions'],
      filter: projectIdFilter,
    },
  }


  return (
    <Resource config={config} name="interview_questions">
      <InterviewQuestionsFilter />
      <InterviewQuestionTable />
      <Modals modals={MODALS} />
    </Resource>
  )
}
