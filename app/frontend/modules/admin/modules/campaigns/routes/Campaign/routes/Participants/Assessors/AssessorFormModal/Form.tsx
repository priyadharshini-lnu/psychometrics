import React, { useEffect, useState } from 'react'
import {
  Form as AntForm, Select, Button, Checkbox, Tooltip,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'

import UserAutocomplete from '~/components/UserAutocomplete'

import {
  AssessorFormItem,
  getAvailableAssessments, getLeadAssessorAssessment,
  fetchAvailableAssessments, fetchLeadAssessorAssessment,
} from '~/modules/admin/modules/campaigns/core/assessors'
import { get as getAutocomplete } from '~/modules/admin/core/ui/autocomplete'
import { RootState } from '~/modules/admin/core/rootReducers'

import userPresenter from '~/presenters/user'

const formItemLayout = { labelCol: { span: 5 }, wrapperCol: { span: 12 } }

const { I18n } = window
const localI18n = (code, params = {}) => I18n.t(`admin.${code}`, params)

const connecter = connect(
  (state: RootState) => ({
    autocompletedAssessors: getAutocomplete(state).assessors || [],
    autocompletedSubjects: getAutocomplete(state).subjects || [],
    assessments: getAvailableAssessments(state),
    leadAssessment: getLeadAssessorAssessment(state),
  }),
  {
    fetchAvailableAssessments,
    fetchLeadAssessorAssessment,
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
  leadAssessment,
  autocompletedSubjects,
  autocompletedAssessors,
  onSubmit,
  fetchAvailableAssessments,
  fetchLeadAssessorAssessment,
  userSearchUrl,
  adminsSearchUrl,
}) => {
  const [assessor, setAssessor] = useState({} as AssessorFormItem)
  const [autocompletedSubject, setAutocompletedSubject] = useState('')
  const [autocompletedAssessor, setAutocompletedAssessor] = useState('')
  const [leadSelected, setLeadSelected] = useState(false)

  useEffect(() => {
    fetchAvailableAssessments(campaignId)
    fetchLeadAssessorAssessment(campaignId)
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
    setAutocompletedSubject('')
    setAutocompletedAssessor('')
    onSubmit(assessor)
  }

  const handleSelectedAssessments = (e) => {
    if (leadSelected) {
      setAssessor({ ...assessor, assessmentIds: [assessments[0].id] })
    } else {
      setAssessor({ ...assessor, assessmentIds: [(leadAssessment?.id) || 0] })
    }
    setLeadSelected(e.target.checked)
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
        <Checkbox
          onChange={handleSelectedAssessments}
          disabled={!leadAssessment}
        >
          {leadAssessment
            ? localI18n('add_lead_assessor')
            : (
              <Tooltip title={localI18n('add_lead_assessor_hint')}>
                {localI18n('add_lead_assessor')}
              </Tooltip>
            )
          }
        </Checkbox>
      </AntForm.Item>
      {!leadSelected && (
        <AntForm.Item label={localI18n('assessments')}>
          <Select
            mode="multiple"
            value={assessor.assessmentIds}
            onChange={ids => setAssessor({ ...assessor, assessmentIds: ids })}
            filterOption={(input, option) => option?.key.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          >
            {assessments.map(a => (<Select.Option key={a.name} value={a.id}>{a.name}</Select.Option>))}
          </Select>
        </AntForm.Item>
      )}
      {leadSelected && (
        <AntForm.Item label={localI18n('lead_assessment')}>
          <Select
            disabled
            mode="multiple"
            value={leadAssessment?.id}
          >
            <Select.Option key={leadAssessment?.name} value={leadAssessment?.id}>{leadAssessment?.name}</Select.Option>
          </Select>
        </AntForm.Item>
      )}
      <AntForm.Item wrapperCol={{ span: 12, offset: 5 }}>
        <Button type="primary" onClick={onClick}>
          {I18n.t('shared.add')}
        </Button>
      </AntForm.Item>
    </AntForm>
  )
}

export default connecter(Form)
