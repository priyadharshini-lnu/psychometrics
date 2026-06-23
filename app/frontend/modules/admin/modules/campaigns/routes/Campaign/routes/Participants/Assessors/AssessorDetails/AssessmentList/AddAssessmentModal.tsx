import React, { useState, useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router-dom'
import isEmpty from 'lodash/isEmpty'
import {
  Form, Select, Input, Checkbox,
} from 'antd'
import ResourceFormModal from '~/components/ResourceFormModal'
import UserAutocomplete from '~/components/UserAutocomplete'
import { get as getAutocomplete } from '~/modules/admin/core/ui/autocomplete'
import { RootState } from '~/modules/admin/core/rootReducers'
import {
  getAvailableAssessments,
  fetchAvailableAssessments,
  getLeadAssessorAssessment,
  fetchLeadAssessorAssessment,
} from '~/modules/admin/modules/campaigns/core/assessors'
import userPresenter from '~/presenters/user'

const { I18n } = window

const connecter = connect(
  (state: RootState) => ({
    autocompletedSubjects: getAutocomplete(state).subjects || [],
    assessments: getAvailableAssessments(state),
    leadAssessment: getLeadAssessorAssessment(state),
  }),
  {
    fetchAvailableAssessments,
    fetchLeadAssessorAssessment,
  },
)

type PropsFromRedux = ConnectedProps<typeof connecter>

interface OwnProps {
  close(): void
}

type Props = OwnProps & PropsFromRedux

const localI18n = (code: string, params = {}) => I18n.t(`admin.assessor_add_subject_modal_${code}`, params)

const AddAssessmentModal: React.FC<Props> = ({
  assessments,
  leadAssessment,
  autocompletedSubjects,
  fetchAvailableAssessments,
  fetchLeadAssessorAssessment,
  close,
}) => {
  const { campaignId, id } = useParams() as { campaignId: string, id: string }
  const parsedCampaignId = parseInt(campaignId, 10)
  const parsedAssessorId = parseInt(id, 10)
  const [leadSelected, setLeadSelected] = useState(false)

  useEffect(() => {
    fetchAvailableAssessments(campaignId)
    fetchLeadAssessorAssessment(campaignId)
  }, [])
  const [form] = Form.useForm()
  const [autocompletedSubject, setAutocompletedSubject] = useState('')

  const onSubjectSelect = (user) => {
    const data = JSON.parse(user)
    form.setFieldsValue({ subjectId: data.id })
    setAutocompletedSubject(userPresenter.getFullNameWithEmail(data))
  }

  const handleSelectedAsLeadAssessor = (e) => {
    if (!leadAssessment) return
    if (e.target.checked) {
      form.setFieldsValue({ assessmentId: leadAssessment?.id })
    } else {
      form.setFieldsValue({ assessmentId: undefined })
    }
    setLeadSelected(e.target.checked)
  }

  const fieldItemPropsForSubject = (errors: string[] | undefined): { validateStatus: 'error', help: string[] } | {} => {
    if (isEmpty(errors)) return {}

    return { validateStatus: 'error', help: errors }
  }

  return (
    <ResourceFormModal
      requestScope="assessorAssessment"
      resourceName="subject"
      readableResourceName="Subject"
      resourceBaseUrl={
      `/administration/new_campaigns/${parsedCampaignId}/assessors/${parsedAssessorId}/user_assessments/`
      }
      storeManager={{ form }}
      showSuccessMessages
      close={close}
      modalProps={{ width: 620 }}
    >
      {({ fieldsUtil }) => (
        <>
          <Form.Item name="subjectId" noStyle>
            <Input type="hidden" />
          </Form.Item>
          <Form.Item
            label={localI18n('subject')}
            required
            {...fieldItemPropsForSubject(fieldsUtil.getErrorsFor('subjectId') || [''])}
          >
            <UserAutocomplete
              value={autocompletedSubject}
              onChange={setAutocompletedSubject}
              onSelect={onSubjectSelect}
              users={autocompletedSubjects}
              url={`/administration/new_campaigns/${campaignId}/users/search`}
              source="subjects"
              placeholder={localI18n('subject_placeholder')}
            />
            {leadAssessment ? (
              <Checkbox
                onChange={handleSelectedAsLeadAssessor}
              >
                {localI18n('mark_as_lead_assessor')}
              </Checkbox>
            ) : null}
          </Form.Item>
          {!leadSelected && (
            <Form.Item name="assessmentId" label={localI18n('assessment')} rules={[{ required: true }]}>
              <Select optionFilterProp="children" showSearch>
                {assessments.map(a => (
                  <Select.Option key={a.id} value={a.id}>
                    {a.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}
          {leadSelected && leadAssessment && (
            <Form.Item name="assessmentId" label={localI18n('assessment')} rules={[{ required: true }]}>
              <Select
                disabled
                mode="multiple"
              >
                <Select.Option
                  key={leadAssessment.name}
                  value={leadAssessment.id}
                >
                  {leadAssessment.name}
                </Select.Option>
              </Select>
            </Form.Item>
          )}
        </>
      )}
    </ResourceFormModal>
  )
}

export default connecter(AddAssessmentModal)
