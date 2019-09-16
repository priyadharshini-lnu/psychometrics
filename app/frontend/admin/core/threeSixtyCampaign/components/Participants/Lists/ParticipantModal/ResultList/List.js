/* eslint-disable max-len */
import React from 'react'
import { Icon, Table } from 'antd'
import userPresenter from 'presenters/userPresenter'
import { ASSIGN_TYPES } from 'constants/relationship'
import { StatusSelect, RelationSelect } from '../List'
import Confirmation from '../Confirmation'

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
            <Icon type="eye" />
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
          <Confirmation
            title={I18n.t('threesixty.confirm')}
            onConfirm={() => destroyEvaluation(id, result.subjectId, evaluator.id)}
          >
            <Icon type="delete" />
          </Confirmation>
        )}
      />
    </Table>
  )
}
