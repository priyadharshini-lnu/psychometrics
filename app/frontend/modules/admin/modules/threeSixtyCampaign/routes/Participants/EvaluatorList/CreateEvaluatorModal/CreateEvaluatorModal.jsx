import { useEffect } from 'react'
import _ from 'lodash'
import {
  Modal, Button, Divider,
} from 'antd'
import { CheckOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import SpreadSheet from '~/components/SpreadSheet'
import spreadSheetUtils from '~/modules/admin/utils/spreadSheet'
import ErrorAlertBox from '~/components/ErrorAlertBox'
import { relationshipWithoutSelf } from '~/core/relationship'
import { setIn } from '~/utils/immutable'
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
    name: "Evaluator's Locale",
    key: 'evaluatorLocale',
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
  relationships,
  creationInProgress,
  clearForm,
}) {
  const { campaignId } = useParams()
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
      evaluatorLocale: user.evaluator && user.evaluator.locale,
      relationshipName: user.relationship.name,
    })
    fillEvaluators(newEvaluators)
  }

  return (
    <Modal
      width={900}
      title="Add evaluators"
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
      <Form onSubmit={onSubmitForm} />
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
