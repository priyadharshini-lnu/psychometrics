import {
  MenuProps, App,
} from 'antd'
import { ExclamationCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { MenuItem } from '~/interfaces/Antd'

const { I18n } = window

interface ActionMenuData {
  campaignId: string
  id: number
  email: string
  permissions: {
    loginAs: boolean
    remove: boolean
  }
  remove(): void
}

export const getActionsMenuProps = ({
  campaignId, id, remove, email, permissions,
}: ActionMenuData):MenuProps => {
  const { modal, message } = App.useApp()
  const handleDelete = () => {
    modal.confirm({
      title: I18n.t('common.text.confirm'),
      icon: <ExclamationCircleOutlined />,
      centered: true,
      width: 650,
      content: I18n.t('administration.assessor.remove_confirmation', { email }),
      okText: I18n.t('common.text.ok'),
      cancelText: I18n.t('common.text.cancel'),
      onOk: () => {
        remove()
        message.success(I18n.t('campaign_users.details.modals.remove.successfully', { email }))
      },
    })
  }

  const menuItems: MenuItem[] = []
  permissions.remove && menuItems.push({
    key: 'remove',
    label: I18n.t('common.actions.remove'),
  })
  permissions.loginAs && menuItems.push({
    key: 'loginAs',
    label: (
      <a
        href={`/administration/new_campaigns/${campaignId}/assessors/${id}/spoof`}
      >
        {I18n.t('frontend.login')}
      </a>
    ),
  })

  const handleMenuClick = ({ key }) => {
    if (key === 'remove') {
      handleDelete()
    }
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}
