import React from 'react'
import _ from 'lodash'
import {
  Modal, Button, Icon, Input, Divider, AutoComplete, Alert,
} from 'antd'
import userPresenter from 'presenters/userPresenter'
import { setIn } from 'utils/immutable'
import SpreadSheet from 'components/SpreadSheet'
import spreadSheetUtils from 'utils/spreadSheet'

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

export default function CreateSubjectModal ({
  current,
  closeModal,
  searchUsersInProject,
  tempUsers,
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
      <AutoComplete
        dataSource={tempUsers.map(user => ({
          value: JSON.stringify(user),
          text: userPresenter.getFullNameWithEmail(user),
        }))}
        autoFocus
        placeholder="Search User..."
        onSelect={onSelect}
      >
        <Input.Search style={{ width: 300 }} onSearch={value => searchUsersInProject(clientId, projectId, value)} />
      </AutoComplete>
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
