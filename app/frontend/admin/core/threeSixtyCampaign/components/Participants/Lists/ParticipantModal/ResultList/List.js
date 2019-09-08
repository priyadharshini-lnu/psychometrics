/* eslint-disable max-len */
import React from 'react'
import { Icon, Select, Table } from 'antd'
import userPresenter from 'presenters/userPresenter'
import { ASSIGN_TYPES } from 'constants/relationship'

const MANAGER_STATUSES = ['waiting', 'approved', 'denied']

export default function List ({
  participants,
  relationships,
  update,
  remove,
  options,
  match: {
    params: { campaignId },
  },
}) {
  const updateParticipant = (id, attrs) => update(campaignId, id, attrs)

  const destroyEvaluation = (participantId, subjectId, evaluationId) => {
    // eslint-disable-next-line no-alert
    if (confirm('Are you sure?')) remove(campaignId, participantId, subjectId, evaluationId)
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
            <Icon type="eye" />
            {' '}
            {result.id}
          </a>
        )}
      />
      <Table.Column
        title="Evaluator"
        key="evaluatorName"
        render={({ user }) => userPresenter.getFullNameWithEmail(user)}
      />
      <Table.Column
        title="Relationship"
        key="relationshipName"
        render={({ relationship, id }) => (
          relationship.name === 'Self'
            ? 'Self'
            : (
              <RelationSelect
                id={id}
                relationships={relationships}
                onChange={updateParticipant}
                currentRelationship={relationship}
              />
            )
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
            managerEvaluationStatus={managerEvaluationStatus}
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
        render={({ result: { completedAt } }) => (
          moment(completedAt).format('YYYY-MM-DD HH:mm:ss')
        )}
      />
      <Table.Column
        title="Duration"
        key="duration"
        render={({ result: { createdAt, completedAt } }) => (
          moment.utc(moment(completedAt).diff(moment(createdAt))).format('HH[h] mm[m] ss[s]')
        )}
      />
      <Table.Column
        key="actions"
        render={({
          id, relationship, result, evaluator,
        }) => relationship.assignType === ASSIGN_TYPES.MANUAL && (
          <Icon type="delete" onClick={() => destroyEvaluation(id, result.subjectId, evaluator.id)} />
        )}
      />
    </Table>
  )
}

const RelationSelect = ({
  relationships, currentRelationship, onChange, id,
}) => (
  <Select
    disabled={currentRelationship && currentRelationship.assignType === ASSIGN_TYPES.AUTOMATIC}
    style={{ width: '100%' }}
    value={currentRelationship && currentRelationship.id}
    onChange={v => onChange(id, { relationshipId: v })}
  >
    {relationships.map(r => (
      <Select.Option key={r.id} value={r.id} disabled={r.assignType === ASSIGN_TYPES.AUTOMATIC}>
        {r.name}
      </Select.Option>
    ))}
  </Select>
)

const StatusSelect = ({
  availableStatuses, managerEvaluationStatus, onChange, id, name, disabled,
}) => (
  <Select
    disabled={disabled}
    style={{ width: '100%' }}
    value={managerEvaluationStatus}
    onChange={v => onChange(id, { [name]: v })}
  >
    {availableStatuses.map(status => (
      <Select.Option key={status} value={status}>
        {status}
      </Select.Option>
    ))}
  </Select>
)
