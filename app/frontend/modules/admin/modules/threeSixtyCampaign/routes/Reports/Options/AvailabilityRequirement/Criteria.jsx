import { Input, Select } from 'antd'
import cs from 'classnames'
import { MinusCircleOutlined, PlusCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import NestedOperator from '~/modules/admin/modules/threeSixtyCampaign/components/NestedOperator'
import styles from './styles.less'

export default function Criteria ({
  condition: {
    operator, type, numberOfEvaluator, relationship,
  },
  relationships,
  addAvailiblityCondition,
  updateAvailiblityCondition,
  removeAvailiblityCondition,
  moveConditionToNextLogicSet,
}) {
  return (
    <div style={{ display: 'inline-block' }} className="mbs">
      <span className="mrs">from have been completed</span>
      <NestedOperator
        operator={operator}
        update={value => updateAvailiblityCondition('operator', value)}
        moveConditionToNextLogicSet={moveConditionToNextLogicSet}
      />
      <Input
        value={numberOfEvaluator}
        size="small"
        className={cs([styles.inputElement, styles.width80])}
        onChange={(e) => {
          updateAvailiblityCondition('numberOfEvaluator', e.target.value)
        }}
      />
      <Select
        value={type}
        size="small"
        className={styles.inputElement}
        dropdownMatchSelectWidth={false}
        onChange={value => updateAvailiblityCondition('type', value)}
      >
        <Select.Option key="evaluations">Evaluation(s)</Select.Option>
      </Select>
      <Select
        value={relationship}
        size="small"
        className={styles.inputElement}
        dropdownMatchSelectWidth={false}
        onChange={value => updateAvailiblityCondition('relationship', value)}
      >
        {relationships.map(r => (<Select.Option key={r.id} value={r.id}>{r.name}</Select.Option>))}
      </Select>
      <span>
        <MinusCircleOutlined className={styles.deleteIcon} onClick={removeAvailiblityCondition} />
        <PlusCircleOutlined className={styles.addIcon} onClick={addAvailiblityCondition} />
      </span>
    </div>
  )
}
