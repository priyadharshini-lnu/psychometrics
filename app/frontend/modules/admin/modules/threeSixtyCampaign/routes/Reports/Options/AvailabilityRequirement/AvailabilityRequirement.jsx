import _ from 'lodash'
import { Select } from 'antd'
import cs from 'classnames'
import Criteria from './Criteria'
import styles from './styles.less'

export default function AvailabilityRequirement ({
  conditions,
  relationships,
  addAvailiblityCondition,
  removeAvailiblityCondition,
  updateAvailiblityCondition,
  addNewLogicalSetCondition,
  moveConditionToNextLogicSet,
}) {
  const defaultRelationshipId = relationships[0]?.id
  if (_.isEmpty(conditions)) {
    return (
      <div
        className={styles.addLink}
        onClick={() => addNewLogicalSetCondition({ relationship: defaultRelationshipId })}
        role="button"
        tabIndex={0}
      >
        {I18n.t('admin.add_conditions')}
      </div>
    )
  }
  return conditions.map((subCondition, parentIndex) => (
    <div className="mbs" key={parentIndex}>
      {conditions.length > 1 && (
        <Operator
          operator={subCondition.operator}
          addNewLogicalSetCondition={
            () => addNewLogicalSetCondition({ operator: 'and', relationship: defaultRelationshipId })
          }
          updateAvailiblityCondition={value => updateAvailiblityCondition(parentIndex, null, 'operator', value)}
        />
      )}
      <div className="mlm">
        {subCondition.conditions.map((condition, childIndex) => (
          <div key={childIndex}>
            <Criteria
              addAvailiblityCondition={
                () => addAvailiblityCondition(parentIndex, { relationship: defaultRelationshipId })
              }
              moveConditionToNextLogicSet={() => moveConditionToNextLogicSet(parentIndex, childIndex)}
              removeAvailiblityCondition={() => removeAvailiblityCondition(parentIndex, childIndex)}
              updateAvailiblityCondition={(field, value) => (
                updateAvailiblityCondition(parentIndex, childIndex, field, value)
              )}
              relationships={relationships}
              condition={condition}
            />
          </div>
        ))}
      </div>
    </div>
  ))
}

function Operator ({ operator, addNewLogicalSetCondition, updateAvailiblityCondition }) {
  const handleOperatorChange = (value) => {
    if (value === 'new_logic_set') {
      addNewLogicalSetCondition()
    } else {
      updateAvailiblityCondition(value)
    }
  }

  if (operator === 'if') {
    return <div className={cs([styles.operator, 'mbm'])}>If</div>
  }
  return (
    <Select
      value={operator}
      className={cs([styles.inputElement, styles.operator, 'mbm', 'mtm'])}
      dropdownMatchSelectWidth={false}
      onChange={handleOperatorChange}
    >
      <Select.Option key="and">And If</Select.Option>
      <Select.Option key="or">Or If</Select.Option>
      <Select.Option key="new_logic_set">Add Anthore Logic Set</Select.Option>
    </Select>
  )
}
