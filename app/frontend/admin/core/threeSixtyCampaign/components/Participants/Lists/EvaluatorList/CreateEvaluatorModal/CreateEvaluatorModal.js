import React, { useEffect } from 'react'
import _ from 'lodash'
import {
  Modal, Button, Icon, Divider,
} from 'antd'
import { setIn } from 'utils/immutable'
import SpreadSheet from 'components/SpreadSheet'
import spreadSheetUtils from 'utils/spreadSheet'
import ErrorAlertBox from 'admin/core/threeSixtyCampaign/components/common/ErrorAlertBox'
import { relationshipWithoutSelf } from 'utils/relationship'
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
    key: 'relationshipName',
    type: 'Dropdown',
    values: ({ relationships }) => relationshipWithoutSelf(relationships).map(r => ({ key: r.id, value: r.name })),
  },
]

export default function CreateEvaluatorModal ({
  closeModal,
  fillEvaluators,
  createAllEvaluators,
  evaluators,
  errors,
  match,
  relationships,
  creationInProgress,
  clearForm,
  match: {
    params: { campaignId },
  },
}) {
  useEffect(() => () => {
    clearForm()
  }, [])

  const handleOk = () => {
    createAllEvaluators(
      campaignId,
      _.filter(
        evaluators,
        s => s.subjectEmail || s.evaluatorEmail || s.evaluatorLastName || s.evaluatorFirstName || s.relationshipName,
      ),
    )
  }

  const onSubmitForm = (user) => {
    const newEvaluators = setIn(evaluators, spreadSheetUtils.getFreeRowIndex(evaluators), {
      subjectEmail: user.subject && user.subject.email,
      evaluatorEmail: user.evaluator && user.evaluator.email,
      evaluatorFirstName: user.evaluator && user.evaluator.firstName,
      evaluatorLastName: user.evaluator && user.evaluator.lastName,
      relationshipName: user.relationship.name,
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
        <Button key="submit" type="primary" disabled={creationInProgress} onClick={handleOk}>
          <Icon type="check" />
          Add
        </Button>,
      ]}
    >
      <Form match={match} onSubmit={onSubmitForm} />
      <Divider />
      <SpreadSheet
        fields={tableFields}
        entities={evaluators}
        updateEntities={fillEvaluators}
        context={{ relationships }}
      />
      <ErrorAlertBox errors={errors} />
    </Modal>
  )
}
