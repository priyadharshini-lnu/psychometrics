import {
  Button, MenuProps,
} from 'antd'
import { ToolOutlined, DownOutlined, MoreOutlined } from '@ant-design/icons'
import { MenuItem } from '~/interfaces/Antd'
import ConditionalDropdown from '~/components/ConditionalDropdown'

const { I18n } = window

export const ToolsDropdown: React.FC<{
  isBulk?: boolean,
  onClick: (action: string) => void,
  isDisabled?: boolean,
}> = ({
  isBulk, onClick, isDisabled,
}) => {
  const btn = (
    <Button disabled={isDisabled}>
      <ToolOutlined />
      <span>{I18n.t('administration.scoring.subject_list.actions')}</span>
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
    label: <span>{I18n.t('administration.ai_artifacts.generate_results')}</span>,
  })

  const handleMenuClick = ({ key }) => {
    onClick(key)
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}
