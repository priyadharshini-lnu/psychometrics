import { Menu, Dropdown as AntDropdown } from 'antd'
import { CaretDownFilled } from '@ant-design/icons'
import { getMenuItems } from '~/utils/array'

const menu = (field, context, insert) => {
  const handleMenuClick = ({ key }) => {
    const fieldItem = field.items(context).find(item => item.key === key)
    insert(field.getValue(fieldItem))
  }
  return (
    <Menu onClick={handleMenuClick} items={getMenuItems(field.items(context), 'value', 'key')} />
  )
}

const Dropdown = ({ field, context, insert }) => (
  <AntDropdown overlay={menu(field, context, insert)} overlayStyle={{ zIndex: 10001 }}>
    <a className="ant-dropdown-link" href="#" style={{ display: 'block' }}>
      {field.name}
      {' '}
      <CaretDownFilled />
    </a>
  </AntDropdown>
)

export default Dropdown
