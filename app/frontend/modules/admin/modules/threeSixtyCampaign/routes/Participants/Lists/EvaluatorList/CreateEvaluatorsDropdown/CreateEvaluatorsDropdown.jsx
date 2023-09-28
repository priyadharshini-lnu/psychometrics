import {
  Button, Menu,
} from 'antd'
import { PlusOutlined, DownOutlined } from '@ant-design/icons'
import ConditionalDropdown from '~/components/ConditionalDropdown'

const CreateEvaluatorsDropdown = ({ openModal, permissions }) => {
  const menuItems = []
  permissions.addEvaluator && menuItems.push({
    key: 'add',
    label: 'Add Evaluators...',
  })
  permissions.importEvaluator && menuItems.push({
    key: 'import',
    label: 'Import Evaluators...',
  })

  const handleMenuClick = ({ key }) => {
    if (key === 'add') {
      openModal('CreateEvaluatorModal')
    }
    if (key === 'import') {
      openModal('EvaluatorImportModal')
    }
  }
  const menu = (
    <Menu items={menuItems} onClick={handleMenuClick} />
  )

  return (
    <ConditionalDropdown
      menu={menu}
      className="mrm"
      hideForEmptyMenu
      innerElement={(
        <Button type="primary">
          <PlusOutlined />
          <span>Add Evaluators</span>
          <DownOutlined />
        </Button>
      )}
    />
  )
}

export default CreateEvaluatorsDropdown
