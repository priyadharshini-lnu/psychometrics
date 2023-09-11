import React, { useState, useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router-dom'
import isEmpty from 'lodash/isEmpty'
import { Form, Select, Input } from 'antd'
import ResourceFormModal from '~/components/ResourceFormModal'
import UserAutocomplete from '~/components/UserAutocomplete'
import { get as getAutocomplete } from '~/modules/admin/core/ui/autocomplete'
import { RootState } from '~/modules/admin/core/rootReducers'
import {
  getAvailableAssessments,
  fetchAvailableAssessments,
} from '~/modules/admin/modules/campaigns/core/assessors'
import userPresenter from '~/presenters/user'

const { I18n } = window

const connecter = connect(
  (state: RootState) => ({
    autocompletedSubjects: getAutocomplete(state).subjects || [],
    assessments: getAvailableAssessments(state),
  }),
  {
    fetchAvailableAssessments,
  },
)

type PropsFromRedux = ConnectedProps<typeof connecter>

interface OwnProps {
  close(): void
}

type Props = OwnProps & PropsFromRedux

const localI18n = (code: string, params = {}) => I18n.t(`administration.assessor.add_subject_modal.${code}`, params)

const AddAssessmentModal: React.FC<Props> = ({
  assessments,
  autocompletedSubjects,
  fetchAvailableAssessments,
  close,
}) => {
  const { campaignId, id } = useParams<{ campaignId: string, id: string }>()
  const parsedCampaignId = parseInt(campaignId, 10)
  const parsedAssessorId = parseInt(id, 10)

  useEffect(() => {
    fetchAvailableAssessments(campaignId)
  }, [])
  const [form] = Form.useForm()
  const [autocompletedSubject, setAutocompletedSubject] = useState('')

  const onSubjectSelect = (user) => {
    const data = JSON.parse(user)
    form.setFieldsValue({ subjectId: data.id })
    setAutocompletedSubject(userPresenter.getFullNameWithEmail(data))
  }

  const fieldItemPropsForSubject = (errors: string[]): { validateStatus: 'error', help: string[] } | {} => {
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
          </Form.Item>
          <Form.Item name="assessmentId" label={localI18n('assessment')} rules={[{ required: true }]}>
            <Select>
              {assessments.map(a => (
                <Select.Option key={a.id} value={a.id}>
                  {a.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}

export default connecter(AddAssessmentModal)
