import React from 'react'
import { Icon, Input, message } from 'antd'
import { GLOBAL } from 'constants/relationship'
import styles from './styles.scss'

export default function RelationshipRow ({
  relationship, create, campaignId, remove, update,
}) {
  const removeRelationship = () => {
    remove(campaignId, relationship.id).catch(({ relationship }) => {
      message.error(relationship[0], 5)
    })
  }

  return (
    <tr>
      <td className="ps">
        <Input
          disabled={relationship.type === GLOBAL}
          className={styles.input}
          value={relationship.name}
          onChange={({ currentTarget }) => update(campaignId, relationship.id, { name: currentTarget.value })}
        />
      </td>
      <td>
        <span className="mls">{`${relationship.usage} people`}</span>
      </td>
      <td className="pls">
        {relationship.type !== GLOBAL && (
          <Icon key="1" type="minus-circle" onClick={removeRelationship} className="mls" />
        )}
        <Icon key="2" type="plus-circle" onClick={() => create(campaignId, {})} className="mls" />
      </td>
    </tr>
  )
}
