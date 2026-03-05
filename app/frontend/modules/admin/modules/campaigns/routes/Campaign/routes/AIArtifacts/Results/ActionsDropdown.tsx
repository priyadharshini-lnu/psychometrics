import {
  Button, MenuProps,
} from 'antd'
import { ToolOutlined, DownOutlined, MoreOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { MenuItem } from '~/interfaces/Antd'
import ConditionalDropdown from '~/components/ConditionalDropdown'

const { I18n } = window

export const ActionsDropdown: React.FC<{
  isBulk?: boolean,
  onClick: (action: string) => void,
  isDisabled?: boolean,
}> = ({
  isBulk, onClick, isDisabled,
}) => {
  const btn = (
    <Button disabled={isDisabled}>
      <ToolOutlined />
      <span>{I18n.t('shared.actions')}</span>
      <DownOutlined />
    </Button>
  )

  return (
    <ConditionalDropdown
      menu={getMenuProps({ onClick })}
      innerElement={isBulk ? (btn) : (
        <a>
          <MoreOutlined />
        </a>
      )}
      className="mrm"
    />
  )
}

const getMenuProps = ({ onClick }: {onClick: (action: string) => void}): MenuProps => {
  const menuItems:MenuItem[] = []

  menuItems.push({
    key: 'generate_results',
    label: <span>{I18n.t('admin.ai_artifacts_generate_results')}</span>,
  })

  const handleMenuClick = ({ key }) => {
    onClick(key)
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}
