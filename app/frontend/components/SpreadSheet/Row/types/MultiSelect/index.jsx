import { Select } from 'antd'
import cs from 'classnames'
import styles from './styles.less'

export default function MultiSelect ({
  field, entity, index, updateEntity, context,
}) {
  const onChange = (value) => {
    updateEntity([index, field.key], value)
  }
  return (
    <Select
      className={cs('width100percent', styles.container)}
      placeholder={field.placeholder}
      mode="multiple"
      value={entity[field.key] || []}
      onChange={onChange}
      filterOption={(input, option) => option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
    >
      {field.values(context).map(f => (
        <Select.Option key={f.key} value={f.key}>
          {f.value}
        </Select.Option>
      ))}
    </Select>
  )
}
