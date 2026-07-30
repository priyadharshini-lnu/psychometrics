import { MenuProps } from 'antd'
import { MenuItem } from '~/interfaces/Antd'

const { I18n } = window

interface ActionMenuData {
  campaignId: string
  id: number
  permissions: {
    loginAs: boolean
    remove: boolean
  }
  onRemoveClick(): void
}

export const getActionsMenuProps = ({
  campaignId, id, permissions, onRemoveClick,
}: ActionMenuData):MenuProps => {
  const menuItems: MenuItem[] = []
  permissions.remove && menuItems.push({
    key: 'remove',
    label: I18n.t('shared.remove'),
  })
  permissions.loginAs && menuItems.push({
    key: 'loginAs',
    label: (
      <a
        href={`/administration/new_campaigns/${campaignId}/assessors/${id}/spoof`}
      >
        {I18n.t('shared.login')}
      </a>
    ),
  })

  const handleMenuClick = ({ key }) => {
    if (key === 'remove') {
      onRemoveClick()
    }
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}
