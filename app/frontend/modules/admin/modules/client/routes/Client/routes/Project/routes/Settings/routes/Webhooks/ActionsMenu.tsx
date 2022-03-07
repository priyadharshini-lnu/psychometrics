import React, { FC } from 'react'
import { Button, Menu, Tooltip } from 'antd'
import { MoreOutlined } from '@ant-design/icons'

import ConditionalDropdown from 'components/ConditionalDropdown'

const { I18n } = window

interface Props {
  // Props here
}

export const ActionsMenu: FC<Props> = () => (
  <ConditionalDropdown
    menu={<MenuDropdown />}
    innerElement={(
      <Tooltip title={I18n.t('administration.table.more_actions')}>
        <Button
          type="link"
          aria-label={I18n.t('administration.table.more_actions')}
          aria-haspopup
        >
          <MoreOutlined />
        </Button>
      </Tooltip>
    )}
    hideForEmptyMenu
  />
)

interface MenuProps {
    // Props here
  }

const MenuDropdown: FC<MenuProps> = () => (
  <Menu id="dummy-id" aria-labelledby="dummy">
    <Menu.Item key="edit" onClick={() => null}>
      {I18n.t('administration.projects.webhook_settings.edit')}
    </Menu.Item>
    <Menu.Item key="remove" onClick={() => null}>
      {I18n.t('administration.projects.webhook_settings.delete')}
    </Menu.Item>
  </Menu>
)
