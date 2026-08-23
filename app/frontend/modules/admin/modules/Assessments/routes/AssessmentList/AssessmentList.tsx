import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Resource } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import { AssessmentTable } from './AssessmentTable'
import { AssessmentFilter } from './AssessmentFilter'
import { DetailsDrawer } from './DetailsDrawer'
import { Tabs } from './Tabs'
import { AssessmentFormModal } from './AssessmentFormModal'
import { Assessment, AssessmentTR } from '~/modules/admin/modules/client/core/assessments'

const { I18n } = window

export const AssessmentList: React.FC<{ assessmentTab: string }> = ({ assessmentTab }) => {
  const [drawerAssessment, setDrawerAssessment] = useState<Assessment | undefined>()
  const [closed, closeModal] = useState(true)
  const config = {
    trackUrl: true,
    responseType: AssessmentTR,
    apiConfig: {
      include: ['dimension', 'owner', 'project', 'linked_assessment'],
      fields: { dimensions: ['name'], users: ['name'] },
      include_resource_meta: ['permissions'],
      filter: { with_resource_state: assessmentTab },
    },
  }

  return (
    <Resource
      title={I18n.t('assessments.assessments')}
      config={config}
      name="assessments"
      settingsKey={TABLE_SETTINGS_KEYS.adminAssessments}
      header={<AssessmentFilter openModal={() => closeModal(false)} />}
    >
      <AssessmentTable openDrawer={setDrawerAssessment} />
      {!!drawerAssessment && (
        <DetailsDrawer
          close={() => setDrawerAssessment(undefined)}
          assessment={drawerAssessment}
        />
      )}
      {!closed && (
        <AssessmentFormModal close={() => {
          closeModal(true)
        }}
        />
      )}
    </Resource>
  )
}

export const AssessmentsLayout: React.FC = () => (
  <>
    <Tabs />
    <Outlet />
  </>
)
export const ActiveAssessments = () => <AssessmentList assessmentTab="active" />
export const ArchivedAssessments = () => <AssessmentList assessmentTab="archived" />
export const DeletedAssessments = () => <AssessmentList assessmentTab="deleted" />
