import React from 'react'
import { useParams } from 'react-router-dom'
import { ReflectionQuestionTR } from '~/modules/admin/modules/client/core/reflectionQuestion'

import Modals from '~/modules/admin/components/Modals'
import { Resource } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import { ReflectionQuestionTable } from './Table'
import { FormModal } from './FormModal'
import { ImportModal } from './ImportModal'
import { ReflectionQuestionsFilter } from './Filter'

const { I18n } = window

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
    <Resource
      title={I18n.t('admin.idp_tab_reflection_questions')}
      config={config}
      name="reflection_questions"
      settingsKey={TABLE_SETTINGS_KEYS.projectIdpReflectionQuestions}
    >
      <ReflectionQuestionsFilter />
      <ReflectionQuestionTable />
      <Modals modals={MODALS} />
    </Resource>
  )
}
