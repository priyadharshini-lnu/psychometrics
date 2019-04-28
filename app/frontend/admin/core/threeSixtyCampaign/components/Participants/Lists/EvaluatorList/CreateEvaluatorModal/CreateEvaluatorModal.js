import React from 'react'
import _ from 'lodash'
import {
  Modal, Button, Icon, Divider, Alert,
} from 'antd'
import { setIn } from 'utils/immutable'
import SpreadSheet from 'components/SpreadSheet'
import spreadSheetUtils from 'utils/spreadSheet'
import Form from './Form'

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
  fillEvaluators,
  createAllEvaluators,
  evaluators,
  errors,
  match,
  match: {
    params: { campaignId },
  },
}) {
  if (current !== 'CreateEvaluatorModal') return null

  const handleOk = () => createAllEvaluators(campaignId, _.pickBy(evaluators, s => s.email || s.lastName || s.firstName))

  const onSubmitForm = (user) => {
    const newEvaluators = setIn(evaluators, spreadSheetUtils.getFreeRowIndex(evaluators), {
      subjectEmail: user.subject && user.subject.email,
      evaluatorEmail: user.evaluator && user.evaluator.email,
      evaluatorFirstName: user.evaluator && user.evaluator.firstName,
      evaluatorLastName: user.evaluator && user.evaluator.lastName,
      relationship: user.relationship.name,
    })
    fillEvaluators(newEvaluators)
  }

  return (
    <Modal
      width={900}
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
      <Form match={match} onSubmit={onSubmitForm} />
      <Divider />
      <SpreadSheet fields={tableFields} entities={evaluators} updateEntities={fillEvaluators} />
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
