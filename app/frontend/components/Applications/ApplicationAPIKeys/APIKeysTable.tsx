import React from 'react'
import {
  MenuProps, Switch, Typography,
} from 'antd'
import { MenuItem } from '~/interfaces/Antd'
import { APIKey } from '~/modules/admin/modules/client/core/apiKeys'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { MaskedText } from '~/glint'

const { I18n } = window

type Props = {
  openModal: (apiKey?: APIKey) => void
}
export const APIKeysTable: React.FC<Props> = ({ openModal }) => (
  <Resource.Table pagination>
    <Resource.Column<APIKey>
      title={I18n.t('common.column.id')}
      id="id"
      sorter
      render={apiKey => (
        apiKey.id
      )}
    />
    <Resource.Column<APIKey>
      id="disabled"
      title={I18n.t('common.column.active')}
      render={apiKey => <ActiveSwitch apiKey={apiKey} />}
    />
    <Resource.Column<APIKey>
      title={I18n.t('common.column.key')}
      id="key"
      render={apiKey => <Typography.Text copyable>{apiKey.key}</Typography.Text>}
      width={400}
      sorter
    />
    <Resource.Column<APIKey>
      title={I18n.t('common.column.description')}
      id="description"
      render={apiKey => <Typography.Text>{apiKey.description}</Typography.Text>}
      width={200}
      sorter
    />
    <Resource.Column<APIKey>
      title={I18n.t('common.column.token')}
      id="token"
      width={400}
      render={(_, apiKey) => (
        <MaskedText text={apiKey.token} />
      )}
    />
    <Resource.Column<APIKey>
      title={I18n.t('common.column.updated_at')}
      id="updated_at"
      width={300}
      sorter
    />
    <Resource.Column<APIKey>
      title={I18n.t('common.column.action')}
      id="action"
      render={(_, apiKey) => (
        <Dropdown
          apiKey={apiKey}
          openModal={openModal}
        />
      )}
      width={100}
    />
  </Resource.Table>
)


const ActiveSwitch: React.FC<{ apiKey: APIKey }> = ({ apiKey }) => {
  const { resource } = useResourceContext<APIKey>()
  return (
    <Switch
      checked={!apiKey.disabled}
      onChange={() => {
        resource.updateResource({ id: apiKey.id, disabled: !apiKey.disabled })
      }}
    />
  )
}

type DropDownProps = {
  apiKey: APIKey,
  openModal: Props['openModal']
}
const Dropdown: React.FC<DropDownProps> = ({ apiKey, openModal }) => (
  <ConditionalDropdown
    menu={getActionsMenuProps({ apiKey, openModal })}
  />
)

interface ActionMenuData {
  apiKey: APIKey,
  openModal: Props['openModal']
}

const getActionsMenuProps = ({ apiKey, openModal }: ActionMenuData):MenuProps => {
  const menuItems = [
    apiKey && {
      key: 'edit',
      label: I18n.t('common.actions.edit'),
      onClick: () => openModal(apiKey),
    },
  ].filter(m => m) as MenuItem[]

  return ({ items: menuItems })
}
