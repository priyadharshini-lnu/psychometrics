import React, { useEffect } from 'react'
import {
  Modal, Button, Divider,
} from 'antd'
import filter from 'lodash/filter'
import { connect, ConnectedProps } from 'react-redux'
import SpreadSheet from '~/components/SpreadSheet'
import spreadSheetUtils from '~/modules/admin/utils/spreadSheet'
import {
  getForm, clearForm,
  createAllAssessors, fillAssessors, AssessorFormItem,
  getAvailableAssessments, getLeadAssessorAssessment, CREATE_ALL_ASSESSORS,
} from '~/modules/admin/modules/campaigns/core/assessors'
import { get as getAutocomplete } from '~/modules/admin/core/ui/autocomplete'
import ErrorAlertBox from '~/components/ErrorAlertBox'
import { RootState } from '~/modules/admin/core/rootReducers'
import { setIn } from '~/utils/immutable'
import Form from './Form'
import { isRequestInProgress } from '~/core/request'

interface Props {
  projectId: string
  campaignId: string
  close(): void
  userSearchUrl?: string
  adminsSearchUrl?: string
}

const { I18n } = window
const localI18n = (code, params = {}) => I18n.t(`admin.assessor_modals_create_assessor_${code}`, params)

const tableFields = [
  {
    name: localI18n('sheet_subject_email'),
    key: 'subjectEmail',
  },
  {
    name: localI18n('sheet_assessor_email'),
    key: 'assessorEmail',
  },
  {
    name: localI18n('sheet_assessor_first_name'),
    key: 'assessorFirstName',
  },
  {
    name: localI18n('sheet_assessor_last_name'),
    key: 'assessorLastName',
  },
  {
    name: localI18n('sheet_assessments'),
    key: 'assessmentIds',
    type: 'MultiSelect',
    multiple: true,
    styles: { width: '200px' },
    placeholder: localI18n('sheet_assessments_placeholder'),
    values: ({ assessments }) => assessments.map(a => ({ key: a.id, value: a.name })),
  },
]

const connecter = connect(
  (state: RootState) => ({
    errors: getForm(state).errors,
    assessors: getForm(state).attrs,
    assessments: getAvailableAssessments(state)
      .concat(getLeadAssessorAssessment(state))
      .filter(e => e),
    autocompletedAssessors: getAutocomplete(state).assessors || [],
    autocompletedSubjectsEvaluators: getAutocomplete(state).subjects || [],
    createAllInProgress: isRequestInProgress(state, CREATE_ALL_ASSESSORS),
  }),
  {
    createAllAssessors,
    fillAssessors,
    clearForm,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

const AssessorFormModal: React.FC<Props & PropsFromRedux> = ({
  campaignId,
  projectId,
  close,
  assessors,
  assessments,
  fillAssessors,
  createAllAssessors,
  clearForm,
  errors,
  userSearchUrl,
  adminsSearchUrl,
  createAllInProgress,
}) => {
  useEffect(() => () => {
    clearForm()
  }, [])

  const handleOk = () => {
    const newAssessors = filter(
      assessors,
      a => a.subjectEmail || a.assessorEmail || a.assessorLastName || a.assessorFirstName || a.assessmentIds?.length,
    ) as AssessorFormItem[]
    createAllAssessors(campaignId, newAssessors).then(() => {
      close && close()
    })
  }

  const onSubmitForm = (user) => {
    const newAssessors = setIn(assessors, spreadSheetUtils.getFreeRowIndex(assessors), {
      subjectEmail: user.subject && user.subject.email,
      assessorEmail: user.assessor && user.assessor.email,
      assessorFirstName: user.assessor && user.assessor.firstName,
      assessorLastName: user.assessor && user.assessor.lastName,
      assessmentIds: user.assessmentIds,
    })
    fillAssessors(newAssessors)
  }

  return (
    <Modal
      width={900}
      title={localI18n('title')}
      open
      onCancel={close}
      footer={[
        <Button key="back" onClick={close}>
          {I18n.t('shared.cancel')}
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk} loading={createAllInProgress}>
          {I18n.t('shared.add')}
        </Button>,
      ]}
    >
      <Form
        userSearchUrl={userSearchUrl}
        adminsSearchUrl={adminsSearchUrl}
        campaignId={campaignId}
        projectId={projectId}
        onSubmit={onSubmitForm}
      />
      <Divider />
      <SpreadSheet
        fields={tableFields}
        entities={assessors || []}
        updateEntities={fillAssessors}
        context={{ assessments }}
        className=""
      />
      <ErrorAlertBox errors={errors} className="mt8" scrollToError={false} scrollView={null} />
    </Modal>
  )
}

export default connecter(AssessorFormModal)
