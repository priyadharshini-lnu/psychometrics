import { useState, useEffect } from 'react'
import _ from 'lodash'
import {
  Modal, Button, Divider, Form, Form as AntForm,
} from 'antd'
import { CheckOutlined } from '@ant-design/icons'
import SpreadSheet from '~/components/SpreadSheet'
import spreadSheetUtils from '~/modules/admin/utils/spreadSheet'
import ErrorAlertBox from '~/components/ErrorAlertBox'
import userPresenter from '~/presenters/user'
import UserAutocomplete from '~/components/UserAutocomplete'
import { setIn } from '~/utils/immutable'

const tableFields = [
  {
    name: 'Email',
    key: 'email',
  },
  {
    name: 'First Name',
    key: 'firstName',
  },
  {
    name: 'Last Name',
    key: 'lastName',
  },
  {
    name: 'Locale',
    key: 'locale',
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
  match: {
    params: { projectId, campaignId },
  },
}) {
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
      <SpreadSheet entities={subjects} fields={tableFields} updateEntities={fillSubjects} />
      <ErrorAlertBox errors={errors} />
    </Modal>
  )
}
