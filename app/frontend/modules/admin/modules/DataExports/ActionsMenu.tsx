import { FC } from 'react'
import { Button, Tooltip, MenuProps } from 'antd'
import { MoreOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { MenuItem } from '~/interfaces/Antd'

import { AdminPermissions } from '~/modules/admin/modules/client/core/admin'
import ConditionalDropdown from '~/components/ConditionalDropdown'

const { I18n } = window

interface UserReportEventPermissions {
  export: boolean;
}

export interface ExportPermissions {
  admin_permissions?: AdminPermissions;
  user_report_events?: UserReportEventPermissions;
}

interface Props {
  id: string;
  permissions: ExportPermissions;
  onDownload(type: string): void;
}


export const ActionsMenu: FC<Props> = ({
  permissions,
  onDownload,
  id,
}) => (
  <ConditionalDropdown
    menu={
      getActionMenuProps({
        permissions,
        onDownload,
        id,
      })
    }
    innerElement={(
      <Tooltip title={I18n.t('admin.table_more_actions')}>
        <Button
          id={`menu-button_campaign-admins-${id}`}
          type="link"
          aria-label={I18n.t('admin.table_more_actions')}
          aria-controls={`menu_campaign-admins-${id}`}
          aria-haspopup
        >
          <MoreOutlined />
        </Button>
      </Tooltip>
    )}
    hideForEmptyMenu
    className="mrm"
  />
)

type ActionMenuData = Props

const getActionMenuProps = ({
  permissions,
  onDownload,
  id,
}: ActionMenuData): MenuProps => {
  const menuItems:MenuItem[] = []
  permissions[id]?.export && menuItems.push(
    {
      key: 'download',
      label: (
        <a
          target="_blank"
          rel="noopener noreferrer"
        >
          {I18n.t('shared.export')}
        </a>
      ),
    },
  )

  const handleMenuClick = ({ key }) => {
    if (key === 'download') {
      onDownload(id)
    }
  }

  return ({
    id: `menu_campaign-admins-${id}`,
    'aria-labelledby': `menu-button_campaign-subjects-${id}`,
    items: menuItems,
    onClick: handleMenuClick,
  })
}
