import React from 'react'
import { Icon, Select, Table } from 'antd'
import userPresenter from 'presenters/userPresenter'

const MANAGER_STATUSES = ['waiting', 'approved', 'denied']
const EVALUATOR_STATUSES = ['waiting', 'completed', 'denied']

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
    /* eslint-disable */
    if (confirm('Are you sure?')) remove(campaignId, id)
    /* eslint-enable */
  }

  return (
    <Table className="mtm" rowKey="id" dataSource={participants} pagination={false}>
      <Table.Column
        title="Email"
        key="fullName"
        render={({ user }) => userPresenter.getFullNameWithEmail(user)}
      />
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
        title="Approved"
        key="managerStatus"
        render={({ managerStatus, id }) => (
          <StatusSelect
            availableStatuses={MANAGER_STATUSES}
            id={id}
            name="managerStatus"
            onChange={updateParticipant}
            managerStatus={managerStatus}
          />
        )}
      />
      <Table.Column
        title="Complete"
        key="evaluatorStatus"
        render={({ evaluatorStatus, id }) => (
          <StatusSelect
            availableStatuses={EVALUATOR_STATUSES}
            id={id}
            name="evaluatorStatus"
            onChange={updateParticipant}
            managerStatus={evaluatorStatus}
          />
        )}
      />
      <Table.Column key="actions" render={({ id }) => <Icon type="delete" onClick={() => destroyParticipant(id)} />} />
    </Table>
  )
}

const RelationSelect = ({
  relationships, currentRelationship, onChange, id,
}) => (
  <Select
    style={{ width: '100%' }}
    value={currentRelationship && currentRelationship.id}
    onChange={v => onChange(id, { relationshipId: v })}
  >
    {relationships.map(r => (
      <Select.Option key={r.id} value={r.id}>
        {r.name}
      </Select.Option>
    ))}
  </Select>
)

const StatusSelect = ({
  availableStatuses, managerStatus, onChange, id, name,
}) => (
  <Select style={{ width: '100%' }} value={managerStatus} onChange={v => onChange(id, { [name]: v })}>
    {availableStatuses.map(status => (
      <Select.Option key={status} value={status}>
        {status}
      </Select.Option>
    ))}
  </Select>
)
