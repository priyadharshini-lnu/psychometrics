/* eslint-disable max-len */
import { Table } from 'antd'
import moment from 'moment'
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import userPresenter from '~/presenters/user'
import { ASSIGN_TYPES } from '~/constants/relationship'
import { StatusSelect, RelationSelect } from '../List'
import Confirmation from '../Confirmation'

const MANAGER_STATUSES = ['waiting', 'approved', 'denied']

export default function List ({
  participants,
  relationships,
  permissions,
  update,
  remove,
  options,
  match: {
    params: { campaignId },
  },
}) {
  const updateParticipant = (id, attrs) => update(campaignId, id, attrs)

  const destroyEvaluation = (participantId, subjectId, evaluationId) => {
    remove(campaignId, participantId, subjectId, evaluationId)
  }

  const canApproveEvaluations = () => {
    if (!options) { return true }
    if (!options.participants) { return true }
    if (options.participants.manager.can_approves_evaluations) {
      return true
    }
    return false
  }

  return (
    <Table className="mtm" rowKey="id" dataSource={participants} pagination={false}>
      <Table.Column
        title="Response ID"
        key="responseId"
        render={({ result, evaluator }) => (
          <a
            href={`/administration/threesixty_campaigns/${campaignId}/subjects/${result.subjectId}/evaluations/${evaluator.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <EyeOutlined />
            {' '}
            {result.hash}
          </a>
        )}
      />
      <Table.Column
        title="Evaluator"
        key="evaluatorName"
        render={({ evaluator }) => userPresenter.getFullNameWithEmail(evaluator)}
      />
      <Table.Column
        title="Relationship"
        key="relationshipName"
        render={({ relationship, id }) => (
          <RelationSelect
            id={id}
            relationships={relationships}
            onChange={updateParticipant}
            currentRelationship={relationship}
          />
        )}
      />
      {canApproveEvaluations() && (
      <Table.Column
        title="Approved"
        key="managerEvaluationStatus"
        render={({ managerEvaluationStatus, id, relationship }) => (
          <StatusSelect
            disabled={relationship.assignType === ASSIGN_TYPES.AUTOMATIC}
            availableStatuses={MANAGER_STATUSES}
            id={id}
            name="managerEvaluationStatus"
            onChange={updateParticipant}
            status={managerEvaluationStatus}
          />
        )}
      />
      )}
      <Table.Column
        title="Start Time"
        key="startTime"
        render={({ result: { createdAt } }) => (
          moment(createdAt).format('YYYY-MM-DD HH:mm:ss')
        )}
      />
      <Table.Column
        title="End Time"
        key="endTime"
        render={({ result: { completedAt } }) => {
          if (completedAt) { return moment(completedAt).format('YYYY-MM-DD HH:mm:ss') }
        }}
      />
      {permissions?.allowResultsDelete && (
        <Table.Column
          key="actions"
          render={({
            id, result, evaluator,
          }) => (
            <Confirmation
              title={I18n.t('threesixty.confirm')}
              onConfirm={() => destroyEvaluation(id, result.subjectId, evaluator.id)}
            >
              <DeleteOutlined />
            </Confirmation>
          )}
        />
      )}
    </Table>
  )
}
