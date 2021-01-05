import React, { useEffect } from 'react'
import {
  Modal, Button, Divider,
} from 'antd'
import filter from 'lodash/filter'
import { connect, ConnectedProps } from 'react-redux'
import { CheckOutlined } from '@ant-design/icons'
import SpreadSheet from 'components/SpreadSheet'
import spreadSheetUtils from 'modules/admin/utils/spreadSheet'
import { setIn } from 'utils/immutable'
import {
  getForm, createAllAssessors, fillAssessors, AssessorFormItem, getAvailableAssessments, clearForm,
} from 'modules/admin/modules/campaigns/core/assessors'
import { get as getAutocomplete } from 'modules/admin/core/ui/autocomplete'
import ErrorAlertBox from 'components/ErrorAlertBox'
import Form from './Form'

interface Props {
  projectId: string
  campaignId: string
  close(): void
  assessor?: {
    id: number
  }
}

const { I18n } = window
const localI18n = (code, params = {}) => I18n.t(`administration.assessor.modals.create_assessor.${code}`, params)

const tableFields = [
  {
    name: localI18n('sheet.subject_email'),
    key: 'subjectEmail',
  },
  {
    name: localI18n('sheet.assessor_email'),
    key: 'assessorEmail',
  },
  {
    name: localI18n('sheet.assessor_first_name'),
    key: 'assessorFirstName',
  },
  {
    name: localI18n('sheet.assessor_last_name'),
    key: 'assessorLastName',
  },
  {
    name: localI18n('sheet.assessments'),
    key: 'assessmentIds',
    type: 'MultiSelect',
    multiple: true,
    styles: { width: '200px' },
    placeholder: localI18n('sheet.assessments_placeholder'),
    values: ({ assessments }) => assessments.map(a => ({ key: a.id, value: a.name })),
  },
]


const connecter = connect(
  state => ({
    errors: getForm(state).errors,
    assessors: getForm(state).attrs,
    assessments: getAvailableAssessments(state),
    autocompletedAssessors: getAutocomplete(state).assessors || [],
    autocompletedSubjectsEvaluators: getAutocomplete(state).subjects || [],
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
}) => {
  useEffect(() => () => {
    clearForm()
  }, [])

  const handleOk = () => {
    const newAssessors = filter(
      assessors,
      a => a.subjectEmail || a.assessorEmail || a.assessorLastName || a.assessorFirstName || a.assessmentIds?.length,
    ) as AssessorFormItem[]
    createAllAssessors(campaignId, newAssessors)
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
      visible
      onCancel={close}
      footer={[
        <Button key="back" onClick={close}>
          {localI18n('cancel')}
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          <CheckOutlined />
          {localI18n('add')}
        </Button>,
      ]}
    >
      <Form campaignId={campaignId} projectId={projectId} onSubmit={onSubmitForm} />
      <Divider />
      <SpreadSheet
        fields={tableFields}
        entities={assessors || []}
        updateEntities={fillAssessors}
        context={{ assessments }}
      />
      <ErrorAlertBox errors={errors} className="mt8" scrollToError={false} scrollView={null} />
    </Modal>
  )
}

export default connecter(AssessorFormModal)
