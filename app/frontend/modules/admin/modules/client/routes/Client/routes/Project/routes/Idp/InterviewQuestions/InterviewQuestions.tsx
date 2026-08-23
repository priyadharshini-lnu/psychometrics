import React from 'react'
import { useParams } from 'react-router-dom'
import { InterviewQuestionTR } from '~/modules/admin/modules/client/core/interviewQuestion'

import Modals from '~/modules/admin/components/Modals'
import { Resource } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import { InterviewQuestionTable } from './Table'
import { FormModal } from './FormModal'
import { ImportModal } from './ImportModal'
import { InterviewQuestionsFilter } from './Filter'

const { I18n } = window

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
    <Resource
      title={I18n.t('admin.idp_tab_interview_questions')}
      config={config}
      name="interview_questions"
      settingsKey={TABLE_SETTINGS_KEYS.projectIdpInterviewQuestions}
    >
      <InterviewQuestionsFilter />
      <InterviewQuestionTable />
      <Modals modals={MODALS} />
    </Resource>
  )
}
