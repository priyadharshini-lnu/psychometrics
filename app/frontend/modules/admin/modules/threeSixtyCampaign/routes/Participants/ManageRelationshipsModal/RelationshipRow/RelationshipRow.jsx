import { Input, message } from 'antd'
import { MinusCircleOutlined, PlusCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { GLOBAL } from '~/constants/relationship'
import styles from './styles.less'

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
          <MinusCircleOutlined key="1" onClick={removeRelationship} className="mls" />
        )}
        <PlusCircleOutlined key="2" onClick={() => create(campaignId, {})} className="mls" />
      </td>
    </tr>
  )
}
