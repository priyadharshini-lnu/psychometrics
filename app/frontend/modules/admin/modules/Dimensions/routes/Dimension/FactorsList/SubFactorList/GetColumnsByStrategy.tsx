import { Button, InputNumber, Select } from 'antd'
import { DeleteOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

export default {
  run: (stragey, onChange, onRemove, errors = []) => getColumns(onChange, onRemove, errors).filter(
    c => !c.scoringStrategies
      || c.scoringStrategies.includes(stragey),
  ),
}
const { Option } = Select
export const PREDICATES = ['==', '!=', '>', '>=', '<', '<=']

const getColumns = (onChange, onRemove, errors) => [
  {
    dataIndex: 'icon',
    scoringStrategies: ['sub_factors_conditional_average'],
  },
  {
    title: 'Name',
    dataIndex: 'name',
    render: (record) => {
      const error = errors.find(([id]) => id === record.sub_factor_id)
      return (
        <>
          <div>{record?.name ?? ''}</div>
          {error && (
            <div className="has-error">
              <span className="ant-form-explain">{error[1]}</span>
            </div>
          )}
        </>
      )
    },
  },
  {
    title: 'Predicate',
    dataIndex: 'predicate',
    scoringStrategies: ['sub_factors_conditional_average'],
    render: record => (
      <Select
        dropdownStyle={{ zIndex: 9900 }}
        style={{ width: '60px' }}
        value={record?.predicate}
        size="small"
        onChange={predicate => onChange({ ...record, predicate })}
      >
        {PREDICATES.map(predicate => (
          <Option key={predicate} value={predicate}>
            {predicate}
          </Option>
        ))}
      </Select>
    ),
  },
  {
    title: 'Weight',
    dataIndex: 'weight',
    scoringStrategies: ['sub_factors_conditional_average', 'sub_factors_average', 'sub_factors_sum'],
    render: record => (
      <InputNumber
        value={record?.weight ?? 0}
        size="small"
        min={0}
        max={10}
        step={0.1}
        onChange={weight => onChange({ ...record, weight })}
      />
    ),
  },
  {
    title: 'Value',
    dataIndex: 'value',
    scoringStrategies: ['sub_factors_conditional_average'],
    render: record => (
      <InputNumber
        value={record?.value ?? 0}
        size="small"
        min={0}
        step={0.1}
        onChange={value => onChange({ ...record, value })}
      />
    ),
  },
  {
    title: 'Actions',
    dataIndex: 'operation',
    render: record => (
      <Button
        type="link"
        size="small"
        onClick={() => onRemove(record)}
      >
        <DeleteOutlined />
      </Button>
    ),
  },
]
