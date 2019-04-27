import React, { useState } from 'react'
import _ from 'lodash'
import {
  Modal, Button, Icon, Input, Divider, AutoComplete, Alert,
} from 'antd'
import userPresenter from 'presenters/userPresenter'
import { setIn } from 'utils/immutable'
import SpreadSheet from 'components/SpreadSheet'

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
  createAll,
  errors,
  match: {
    params: { projectId, clientId, campaignId },
  },
}) {
  if (current !== 'CreateSubjectModal') return null

  const [subjects, setSubjects] = useState({})

  const handleOk = () => createAll(campaignId, _.pickBy(subjects, s => s.email || s.lastName || s.firstName))

  const getFreeRowIndex = (subjects) => {
    if (_.isEmpty(subjects)) return 0

    const keys = _.keys(subjects)
      .map(key => parseInt(key, 10))
      .sort()

    /* eslint-disable */
    for (const [index, key] of keys.entries()) {
      if (index !== key) return index
    }
    /* eslint-enable */
    return keys.length
  }

  const onSelect = (user) => {
    const newSubjects = setIn(subjects, getFreeRowIndex(subjects), _.omit(JSON.parse(user), ['id']))
    setSubjects(newSubjects)
  }

  const renderErrorMessage = () => (
    <div>{_.values(errors).map(error => error.map((e, i) => <div key={i}>{e}</div>))}</div>
  )

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
      <SpreadSheet
        entities={subjects}
        fields={tableFields}
        updateEntities={setSubjects}
      />
      {errors && (
        <Alert style={{ whiteSpace: 'pre' }} description={renderErrorMessage()} type="error" className="mtl" showIcon />
      )}
    </Modal>
  )
}
