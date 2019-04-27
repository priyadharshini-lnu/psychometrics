import React from 'react'
import _ from 'lodash'
import {
  Modal, Button, Icon, Divider, Alert, Form, Form as AntForm,
} from 'antd'
import { setIn } from 'utils/immutable'
import SpreadSheet from 'components/SpreadSheet'
import spreadSheetUtils from 'utils/spreadSheet'
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
  current,
  closeModal,
  autocompletedUsers,
  fillSubjects,
  createAll,
  errors,
  subjects,
  match: {
    params: { projectId, clientId, campaignId },
  },
}) {
  if (current !== 'CreateSubjectModal') return null

  const handleOk = () => createAll(campaignId, _.pickBy(subjects, s => s.email || s.lastName || s.firstName))

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
        <Button key="submit" type="primary" onClick={handleOk}>
          <Icon type="check" />
          Add
        </Button>,
      ]}
    >
      <Form {...formItemLayout}>
        <AntForm.Item label="Subject">
          <UserAutocomplete
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
      {errors && (
        <Alert
          style={{ whiteSpace: 'pre' }}
          description={<ErrorMessage errors={errors} />}
          type="error"
          className="mtl"
          showIcon
        />
      )}
    </Modal>
  )
}

function ErrorMessage ({ errors }) {
  return <div>{_.values(errors).map(error => error.map((e, i) => <div key={i}>{e}</div>))}</div>
}
