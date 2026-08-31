import {
  Button, MenuProps,
} from 'antd'
import { ToolOutlined, DownOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { MenuItem } from '~/interfaces/Antd'
import ConditionalDropdown from '~/components/ConditionalDropdown'

const { I18n } = window

export const ToolsDropdown: React.FC<{
  isBulk?: boolean,
  onClick: (action: string) => void,
}> = ({
  isBulk, onClick,
}) => {
  const btn = (
    <Button>
      <ToolOutlined />
      <span>{I18n.t('shared.tools')}</span>
      <DownOutlined />
    </Button>
  )

  return (
    <ConditionalDropdown
      menu={getMenuProps({ onClick })}
      innerElement={isBulk ? btn : undefined}
      className="mrm"
    />
  )
}

const getMenuProps = ({ onClick }: {onClick: (action: string) => void}): MenuProps => {
  const menuItems:MenuItem[] = []

  menuItems.push({
    key: 'export_results',
    label: <span>{I18n.t('admin.results_export')}</span>,
  })

  const handleMenuClick = ({ key }) => {
    onClick(key)
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}
