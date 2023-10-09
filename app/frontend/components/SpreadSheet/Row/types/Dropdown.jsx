import { Dropdown as AntDropdown } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import { getMenuItems } from '~/utils/array'

const getMenuProps = ({ values, onChange }) => (
  { items: getMenuItems(values, 'value', 'value'), onClick: ({ key }) => onChange({ value: key }) }
)

export default function Dropdown ({
  field, entity, index, updateEntity, context,
}) {
  const onChange = ({ value }) => {
    updateEntity([index, field.key], value)
  }
  return (
    <AntDropdown menu={getMenuProps({ values: field.values(context), onChange })} trigger={['click']}>
      <span className="mls">
        {entity[field.key] || 'Choose'}
        {' '}
        <DownOutlined />
      </span>
    </AntDropdown>
  )
}
