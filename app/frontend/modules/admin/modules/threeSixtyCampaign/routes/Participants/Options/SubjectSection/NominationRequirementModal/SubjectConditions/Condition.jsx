import { Input, Select } from 'antd'
import cs from 'classnames'
import { MinusCircleOutlined, PlusCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import NestedOperator from '~/modules/admin/modules/threeSixtyCampaign/components/NestedOperator'
import styles from '../styles.less'

export default function Condition ({
  datasheetFields,
  condition: {
    operator, field, value, comparator,
  },
  add,
  update,
  remove,
  moveConditionToNextLogicSet,
}) {
  return (
    <div style={{ display: 'inline-block' }} className="mbs">
      <NestedOperator
        operator={operator}
        update={value => update('operator', value)}
        remove={remove}
        moveConditionToNextLogicSet={moveConditionToNextLogicSet}
      />
      <Select
        value={field}
        size="small"
        className={styles.inputElement}
        dropdownMatchSelectWidth={false}
        onChange={value => update('field', value)}
      >
        {datasheetFields.map(name => (
          <Select.Option key={name}>{name}</Select.Option>
        ))}
      </Select>
      <Select
        value={comparator}
        size="small"
        dropdownMatchSelectWidth={false}
        className={cs([styles.inputElement, styles.width80])}
        onChange={value => update('comparator', value)}
      >
        <Select.Option key="equal">Is</Select.Option>
        <Select.Option key="not_equal">Is Not</Select.Option>
      </Select>
      <Input
        value={value}
        size="small"
        className={cs([styles.inputElement, styles.width80])}
        onChange={(e) => {
          update('value', e.target.value)
        }}
      />

      <span>
        <MinusCircleOutlined className={styles.deleteIcon} onClick={remove} />
        <PlusCircleOutlined className={styles.addIcon} onClick={add} />
      </span>
    </div>
  )
}
