import { Button } from 'antd'
import { PlusOutlined, DownOutlined } from '@ant-design/icons'
import ConditionalDropdown from '~/components/ConditionalDropdown'

const CreateEvaluatorsDropdown = ({ openModal, permissions, template }) => {
  const menuItems = []
  permissions.addEvaluator && menuItems.push({
    key: 'add',
    label: I18n.t('administration.threesixty_campaigns.menu.participants.evaluators.add_evaluators'),
  })
  permissions.importEvaluator && menuItems.push({
    key: 'import',
    label: I18n.t('administration.threesixty_campaigns.menu.participants.evaluators.import_evaluators'),
  })

  const handleMenuClick = ({ key }) => {
    if (key === 'add') {
      openModal('CreateEvaluatorModal')
    }
    if (key === 'import') {
      openModal('EvaluatorImportModal')
    }
  }

  if (template) return

  return (
    <ConditionalDropdown
      menu={{ items: menuItems, onClick: handleMenuClick }}
      className="mrm"
      hideForEmptyMenu
      innerElement={(
        <Button type="primary">
          <PlusOutlined />
          <span>{I18n.t('administration.threesixty_campaigns.menu.participants.evaluators.add_evaluators')}</span>
          <DownOutlined />
        </Button>
      )}
    />
  )
}

export default CreateEvaluatorsDropdown
