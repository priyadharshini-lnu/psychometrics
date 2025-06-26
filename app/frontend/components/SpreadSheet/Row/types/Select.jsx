import { Select as AntSelect } from 'antd'
import cs from 'classnames'
import styles from './MultiSelect/styles.less'

export default function Select ({
  field,
  entity,
  index,
  updateEntity,
  context,
}) {
  const onChange = (value) => {
    updateEntity([index, field.key], value)
  }

  const values = field.values?.(context) || []

  return (
    <AntSelect
      className={cs('width100percent', styles.container)}
      placeholder={field.placeholder}
      value={entity[field.key] ?? undefined}
      onChange={onChange}
      showSearch
      filterOption={(input, option) => option?.children?.toLowerCase().includes(input.toLowerCase())
      }
    >
      {values.map(f => (
        <AntSelect.Option key={f.value} value={f.value}>
          {f.label}
        </AntSelect.Option>
      ))}
    </AntSelect>
  )
}
