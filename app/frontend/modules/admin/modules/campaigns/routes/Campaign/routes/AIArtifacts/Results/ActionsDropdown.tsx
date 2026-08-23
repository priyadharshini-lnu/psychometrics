import {
  Button, MenuProps,
} from 'antd'
import { ToolOutlined, DownOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
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
      innerElement={isBulk ? btn : undefined}
      className="mrm"
    />
  )
}

const getMenuProps = ({ onClick }: {onClick: (action: string) => void}): MenuProps => {
  const menuItems:MenuItem[] = []

  menuItems.push(
    {
      key: 'generate_results',
      label: <span>{I18n.t('admin.generate_results')}</span>,
    },
    {
      key: 'mark_finalized',
      label: <span>{I18n.t('admin.mark_finalized')}</span>,
    },
    {
      key: 'mark_not_finalized',
      label: <span>{I18n.t('admin.mark_not_finalized')}</span>,
    },
  )

  const handleMenuClick = ({ key }) => {
    onClick(key)
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}
