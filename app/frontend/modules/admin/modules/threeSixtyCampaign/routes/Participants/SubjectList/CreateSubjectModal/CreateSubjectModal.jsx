import { useState, useEffect } from 'react'
import _ from 'lodash'
import {
  Modal, Button, Divider, Form, Form as AntForm,
} from 'antd'
import { CheckOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import SpreadSheet from '~/components/SpreadSheet'
import spreadSheetUtils from '~/modules/admin/utils/spreadSheet'
import ErrorAlertBox from '~/components/ErrorAlertBox'
import userPresenter from '~/presenters/user'
import UserAutocomplete from '~/components/UserAutocomplete'
import { setIn } from '~/utils/immutable'
import { useResources } from '~/hooks/useResources'

const getTableFields = jobRoles => [
  { name: 'Email', key: 'email' },
  { name: 'First Name', key: 'firstName' },
  { name: 'Last Name', key: 'lastName' },
  { name: 'Locale', key: 'locale' },
  {
    name: 'Current Job Role',
    key: 'currentJobRole',
    type: 'Select',
    values: () => jobRoles?.map(role => ({
      label: role.name,
      value: role.name,
    })) || [],
  },
  {
    name: 'Target Job Role',
    key: 'targetJobRole',
    type: 'Select',
    values: () => jobRoles?.map(role => ({
      label: role.name,
      value: role.name,
    })) || [],
  },
]


const formItemLayout = { labelCol: { span: 3 }, wrapperCol: { span: 12 } }

export default function CreateSubjectModal ({
  closeModal,
  autocompletedUsers,
  fillSubjects,
  createAll,
  errors,
  subjects,
  creationInProgress,
  clearForm,
}) {
  const { campaignId, projectId } = useParams()
  useEffect(() => () => {
    clearForm()
  }, [])

  const [autocompletedUser, setAutocompletedUser] = useState('')

  const handleOk = () => createAll(campaignId, _.filter(subjects, s => s.email || s.lastName || s.firstName))

  const onSelect = (user) => {
    const data = JSON.parse(user)
    const newSubjects = setIn(subjects, spreadSheetUtils.getFreeRowIndex(subjects), _.omit(data, ['id']))
    setAutocompletedUser(userPresenter.getFullNameWithEmail(data))
    fillSubjects(newSubjects)
  }

  const {
    data: jobRoles = [],
    fetch: fetchJobRoles,
  } = useResources(`job_roles?project_id=${projectId}`)

  useEffect(() => {
    fetchJobRoles()
  }, [])


  return (
    <Modal
      width={700}
      title="Add subjects"
      open
      onCancel={closeModal}
      footer={[
        <Button key="back" onClick={closeModal}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" disabled={creationInProgress} onClick={handleOk}>
          <CheckOutlined />
          Add
        </Button>,
      ]}
    >
      <Form {...formItemLayout} autoComplete="off">
        <AntForm.Item label="Subject">
          <UserAutocomplete
            value={autocompletedUser}
            onChange={setAutocompletedUser}
            onSelect={onSelect}
            source="users"
            users={autocompletedUsers}
            placeholder="Search Subject..."
            url={`/administration/projects/${projectId}/search_users`}
          />
        </AntForm.Item>
      </Form>
      <Divider />
      <SpreadSheet entities={subjects} fields={getTableFields(jobRoles)} updateEntities={fillSubjects} />
      <ErrorAlertBox errors={errors} />
    </Modal>
  )
}
