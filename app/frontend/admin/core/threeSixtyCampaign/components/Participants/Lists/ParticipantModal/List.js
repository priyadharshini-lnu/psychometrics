import React from 'react'
import {
  Icon, Select, Table, Popconfirm,
} from 'antd'
import userPresenter from 'presenters/userPresenter'
import { ASSIGN_TYPES } from 'constants/relationship'

const MANAGER_STATUSES = ['waiting', 'approved', 'denied']
const EVALUATOR_STATUSES = ['waiting', 'declined']

export default function List ({
  participants,
  relationships,
  update,
  remove,
  match: {
    params: { campaignId },
  },
}) {
  const updateParticipant = (id, attrs) => update(campaignId, id, attrs)

  const destroyParticipant = (id) => {
    remove(campaignId, id)
  }

  return (
    <Table className="mtm" rowKey="id" dataSource={participants} pagination={false}>
      <Table.Column title="Email" key="fullName" render={({ user }) => userPresenter.getFullNameWithEmail(user)} />
      <Table.Column
        title="Relationship"
        key="relationshipname"
        render={({ relationship, id }) => (
          <RelationSelect
            id={id}
            relationships={relationships}
            onChange={updateParticipant}
            currentRelationship={relationship}
          />
        )}
      />
      <Table.Column
        title="Nomination"
        key="managerNominationStatus"
        render={({ managerNominationStatus, id, relationship }) => (
          <StatusSelect
            disabled={relationship.assignType === ASSIGN_TYPES.AUTOMATIC}
            availableStatuses={MANAGER_STATUSES}
            id={id}
            name="managerNominationStatus"
            onChange={updateParticipant}
            status={managerNominationStatus}
          />
        )}
      />
      <Table.Column
        title="Evaluation"
        key="evaluationStatus"
        render={({ evaluationStatus, id }) => (evaluationStatus === 'completed' ? 'completed' : (
          <StatusSelect
            availableStatuses={EVALUATOR_STATUSES}
            id={id}
            name="evaluatorNominationStatus"
            onChange={updateParticipant}
            status={evaluationStatus}
          />
        ))
        }
      />
      <Table.Column
        key="actions"
        render={({ id, relationship }) => relationship.assignType === ASSIGN_TYPES.MANUAL && (
          <Popconfirm
            placement="topRight"
            icon={<Icon type="warning" theme="twoTone" style={{ color: '#f55' }} />}
            title={I18n.t('threesixty.confirm')}
            onConfirm={() => destroyParticipant(id)}
            okText="Yes"
            cancelText="No"
          >
            <Icon type="delete" />
          </Popconfirm>
        )}
      />
    </Table>
  )
}

export const RelationSelect = ({
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

export const StatusSelect = ({
  availableStatuses, status, onChange, id, name, disabled,
}) => (
  <Select
    disabled={disabled}
    style={{ width: '100%' }}
    value={status}
    onChange={v => onChange(id, { [name]: v })}
  >
    {availableStatuses.map(status => (
      <Select.Option key={status} value={status}>
        {status}
      </Select.Option>
    ))}
  </Select>
)
