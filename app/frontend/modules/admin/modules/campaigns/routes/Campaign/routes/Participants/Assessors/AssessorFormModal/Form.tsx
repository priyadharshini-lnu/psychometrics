import React, { useEffect, useState } from 'react'
import { Form as AntForm, Select, Button } from 'antd'
import { connect, ConnectedProps } from 'react-redux'

import UserAutocomplete from '~/components/UserAutocomplete'

import {
  AssessorFormItem,
  getAvailableAssessments,
  fetchAvailableAssessments,
} from '~/modules/admin/modules/campaigns/core/assessors'
import { get as getAutocomplete } from '~/modules/admin/core/ui/autocomplete'
import { RootState } from '~/modules/admin/core/rootReducers'

import userPresenter from '~/presenters/user'

const formItemLayout = { labelCol: { span: 5 }, wrapperCol: { span: 12 } }

const { I18n } = window
const localI18n = (code, params = {}) => I18n.t(`administration.assessor.modals.create_assessor.form.${code}`, params)

const connecter = connect(
  (state: RootState) => ({
    autocompletedAssessors: getAutocomplete(state).assessors || [],
    autocompletedSubjects: getAutocomplete(state).subjects || [],
    assessments: getAvailableAssessments(state),
  }),
  {
    fetchAvailableAssessments,
  },
)

interface AutocompletedUser {
  id: number
  email: string
  first_name: string
  last_name: string
}

interface Props {
  campaignId: string
  projectId: string
  autocompletedSubjects: AutocompletedUser[]
  autocompletedAssessors: AutocompletedUser[]
  onSubmit: (user) => void
  userSearchUrl?: string
  adminsSearchUrl?: string
}

export type PropsFromRedux = ConnectedProps<typeof connecter>

const Form: React.FC<Props & PropsFromRedux> = ({
  campaignId,
  assessments,
  autocompletedSubjects,
  autocompletedAssessors,
  onSubmit,
  fetchAvailableAssessments,
  userSearchUrl,
  adminsSearchUrl,
}) => {
  const [assessor, setAssessor] = useState({} as AssessorFormItem)
  const [autocompletedSubject, setAutocompletedSubject] = useState('')
  const [autocompletedAssessor, setAutocompletedAssessor] = useState('')

  useEffect(() => {
    fetchAvailableAssessments(campaignId)
  }, [])

  useEffect(() => {
    if (assessments.length) setAssessor({ assessmentIds: [assessments[0].id] })
  }, [assessments])

  const onSelect = (field, user) => {
    const data = JSON.parse(user)
    setAssessor({ ...assessor, [field]: JSON.parse(user) })
    if (field === 'subject') {
      setAutocompletedSubject(userPresenter.getFullNameWithEmail(data))
    } else {
      setAutocompletedAssessor(userPresenter.getFullNameWithEmail(data))
    }
  }

  const onClick = () => {
    setAssessor({ assessmentIds: assessor.assessmentIds })
    setAutocompletedSubject('')
    setAutocompletedAssessor('')
    onSubmit(assessor)
  }

  return (
    <AntForm {...formItemLayout}>
      <AntForm.Item label={localI18n('subject')}>
        <UserAutocomplete
          value={autocompletedSubject}
          onChange={setAutocompletedSubject}
          onSelect={user => onSelect('subject', user)}
          users={autocompletedSubjects}
          url={userSearchUrl || `/administration/new_campaigns/${campaignId}/users/search`}
          source="subjects"
          placeholder={localI18n('subject_placeholder')}
        />
      </AntForm.Item>
      <AntForm.Item label={localI18n('assessor')}>
        <UserAutocomplete
          value={autocompletedAssessor}
          onChange={setAutocompletedAssessor}
          users={autocompletedAssessors}
          onSelect={user => onSelect('assessor', user)}
          url={adminsSearchUrl || '/administration/users/search_admins'}
          source="assessors"
          placeholder={localI18n('assessor_placeholder')}
        />
      </AntForm.Item>
      <AntForm.Item label={localI18n('assessments')}>
        <Select
          mode="multiple"
          value={assessor.assessmentIds}
          onChange={ids => setAssessor({ ...assessor, assessmentIds: ids })}
          filterOption={(input, option) => option?.key.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
          {assessments.map(a => (
            <Select.Option key={a.name} value={a.id}>{a.name}</Select.Option>
          ))}
        </Select>
      </AntForm.Item>
      <AntForm.Item wrapperCol={{ span: 12, offset: 5 }}>
        <Button type="primary" onClick={onClick}>
          {localI18n('add')}
        </Button>
      </AntForm.Item>
    </AntForm>
  )
}

export default connecter(Form)
