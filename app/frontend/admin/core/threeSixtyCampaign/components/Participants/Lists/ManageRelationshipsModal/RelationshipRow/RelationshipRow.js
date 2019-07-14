import React from 'react'
import { Icon, Input } from 'antd'
import { GLOBAL } from 'constants/relationship'
import style from './style.scss'

export default function RelationshipRow ({
  relationship, create, campaignId, remove, update,
}) {
  return (
    <tr>
      <td className="ps">
        <Input
          disabled={relationship.type === GLOBAL}
          className={style.input}
          value={relationship.name}
          onChange={({ currentTarget }) => update(campaignId, relationship.id, { name: currentTarget.value })}
        />
      </td>
      <td>
        <span className="mls">{`${relationship.usage} people`}</span>
      </td>
      <td className="pls">
        {relationship.type !== GLOBAL && (
          <Icon key="1" type="minus-circle" onClick={() => remove(campaignId, relationship.id)} className="mls" />
        )}
        <Icon key="2" type="plus-circle" onClick={() => create(campaignId, {})} className="mls" />
      </td>
    </tr>
  )
}
