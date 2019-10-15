import React, { useState, useEffect } from 'react'
import _ from 'lodash'
import {
  Modal, Button, Icon, Divider, Form, Form as AntForm,
} from 'antd'
import { setIn } from 'utils/immutable'
import SpreadSheet from 'components/SpreadSheet'
import spreadSheetUtils from 'utils/spreadSheet'
import ErrorAlertBox from 'admin/core/threeSixtyCampaign/components/common/ErrorAlertBox'
import UserAutocomplete from '../../shared/UserAutocomplete'

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
    params: { projectId, clientId, campaignId },
  },
}) {
  useEffect(() => () => {
    clearForm()
  }, [])

  const [autocompletedUser, setAutocompletedUser] = useState('')

  const handleOk = () => createAll(campaignId, _.filter(subjects, s => s.email || s.lastName || s.firstName))

  const onSelect = (user) => {
    const newSubjects = setIn(subjects, spreadSheetUtils.getFreeRowIndex(subjects), _.omit(JSON.parse(user), ['id']))
    fillSubjects(newSubjects)
  }

  return (
    <Modal
      width={700}
      title="Add subjects"
      visible
      onCancel={closeModal}
      footer={[
        <Button key="back" onClick={closeModal}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" disabled={creationInProgress} onClick={handleOk}>
          <Icon type="check" />
          Add
        </Button>,
      ]}
    >
      <Form {...formItemLayout}>
        <AntForm.Item label="Subject">
          <UserAutocomplete
            value={autocompletedUser}
            onChange={setAutocompletedUser}
            onSelect={onSelect}
            source="users"
            users={autocompletedUsers}
            placeholder="Search Subject..."
            url={`/administration/clients/${clientId}/projects/${projectId}/search_users`}
          />
        </AntForm.Item>
      </Form>
      <Divider />
      <SpreadSheet entities={subjects} fields={tableFields} updateEntities={fillSubjects} />
      <ErrorAlertBox errors={errors} />
    </Modal>
  )
}
