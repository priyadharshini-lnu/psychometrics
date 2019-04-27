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
    name: "Evaluator's Email",
    key: 'evaluatorEmail',
  },
  {
    name: "Evaluator's First Name",
    key: 'evaluatorFirstName',
  },
  {
    name: "Evaluator's Last Name",
    key: 'evaluatorLastName',
  },
  {
    name: "Subject's Email",
    key: 'subjectEmail',
  },
  {
    name: 'Relationship',
    key: 'relationship',
  },
]
export default function CreateEvaluatorModal ({
  current,
  closeModal,
  searchUsers,
  tempUsers,
  createAll,
  errors,
  match: {
    params: { projectId, clientId, campaignId },
  },
}) {
  if (current !== 'CreateEvaluatorModal') return null

  const [evaluators, updateEvaluators] = useState({})
  const [rowSize, updateRowSize] = useState(3)

  const handleOk = () => createAll(campaignId, _.pickBy(evaluators, s => s.email || s.lastName || s.firstName))

  const getFreeRowIndex = (evaluators) => {
    if (_.isEmpty(evaluators)) return 0

    const keys = _.keys(evaluators)
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
    const newEvaluators = setIn(evaluators, getFreeRowIndex(evaluators), _.omit(JSON.parse(user), ['id']))
    if (_.size(newEvaluators) > rowSize) {
      updateRowSize(rowSize + 1)
    }
    updateEvaluators(newEvaluators)
  }

  const renderErrorMessage = () => (
    <div>{_.values(errors).map(error => error.map((e, i) => <div key={i}>{e}</div>))}</div>
  )

  return (
    <Modal
      width={700}
      title="Add evaluators"
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
        placeholder="Search Subject..."
        onSelect={onSelect}
      >
        <Input.Search style={{ width: 300 }} onSearch={value => searchUsers(clientId, projectId, value)} />
      </AutoComplete>
      <Divider />
      <SpreadSheet
        fields={tableFields}
        rowSize={rowSize}
        entities={evaluators}
        updateRowSize={updateRowSize}
        updateEntities={updateEvaluators}
      />
      {errors && (
        <Alert style={{ whiteSpace: 'pre' }} description={renderErrorMessage()} type="error" className="mtl" showIcon />
      )}
    </Modal>
  )
}
