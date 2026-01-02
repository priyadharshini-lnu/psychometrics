import { Dropdown as AntDropdown } from 'antd'
import { CaretDownFilled } from '~/glint/icons/AccessibleIconsAntDesign'
import { getMenuItems } from '~/utils/array'

const getMenuProps = (field, context, insert) => {
  const handleMenuClick = ({ key }) => {
    const fieldItem = field.items(context).find(item => item.key === key)
    insert(field.getValue(fieldItem))
  }
  return ({ items: getMenuItems(field.items(context), 'value', 'key'), onClick: handleMenuClick })
}

const Dropdown = ({ field, context, insert }) => (
  <AntDropdown
    getPopupContainer={node => node.parentNode}
    menu={getMenuProps(field, context, insert)}
    overlayStyle={{ zIndex: 10001 }}
  >
    <a className="ant-dropdown-link" href="#" style={{ display: 'block' }}>
      {field.name}
      {' '}
      <CaretDownFilled />
    </a>
  </AntDropdown>
)

export default Dropdown
