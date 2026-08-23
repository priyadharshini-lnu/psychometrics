import React, { useState } from 'react'
import {
  App, MenuProps, Switch,
} from 'antd'
import { ApplicationIpWhitelistEntry } from '~/modules/admin/modules/client/core/applicationIpWhitelistEntries'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { MenuItem } from '~/interfaces/Antd'
import { EditIpWhiteListModal } from './EditIpWhiteListModal'

const { I18n } = window

type Props = {
  onIpWhitelistingEnabledChange: (enabled: boolean) => void
  onRefreshApplicationSettings: () => Promise<unknown>
}

export const IpWhiteListTable: React.FC<Props> = ({ onIpWhitelistingEnabledChange, onRefreshApplicationSettings }) => (
  <Resource.Table embedded pagination>
    <Resource.Column<ApplicationIpWhitelistEntry>
      title={I18n.t('shared.id')}
      id="id"
      hideable={false}
      dataIndex="id"
      sorter
      fixed="left"
    />
    <Resource.Column<ApplicationIpWhitelistEntry>
      title={I18n.t('admin.application_settings_ip_or_cidr')}
      id="ipOrCidr"
      dataIndex="ipOrCidr"
      render={(_, entry) => entry.ipOrCidr}
      fixed="left"
    />
    <Resource.Column<ApplicationIpWhitelistEntry>
      title={I18n.t('shared.status')}
      id="enabled"
      dataIndex="enabled"
      render={(_, entry) => (
        <IpEntryStatusSwitch
          entry={entry}
          onIpWhitelistingEnabledChange={onIpWhitelistingEnabledChange}
        />
      )}
    />
    <Resource.Column<ApplicationIpWhitelistEntry>
      title={I18n.t('shared.description')}
      id="description"
      dataIndex="description"
      render={(_, entry) => entry.description || '-'}
    />
    <Resource.Column<ApplicationIpWhitelistEntry>
      title={I18n.t('shared.actions')}
      id="actions"
      hideable={false}
      render={(_, entry) => (
        <IpEntryActionsDropdown
          entry={entry}
          onRefreshApplicationSettings={onRefreshApplicationSettings}
        />
      )}
      fixed="right"
    />
  </Resource.Table>
)

const IpEntryStatusSwitch: React.FC<{
  entry: ApplicationIpWhitelistEntry
  onIpWhitelistingEnabledChange: (enabled: boolean) => void
}> = ({ entry, onIpWhitelistingEnabledChange }) => {
  const { resource } = useResourceContext<ApplicationIpWhitelistEntry>()

  const handleChange = async (checked: boolean) => {
    const result = await resource.updateResource({ id: entry.id, enabled: checked })
    onIpWhitelistingEnabledChange(result.ipWhitelistingEnabled)
  }

  return (
    <Switch
      checked={entry.enabled}
      loading={resource.isLoading(`update@${entry.id}`)}
      onChange={handleChange}
    />
  )
}

const IpEntryActionsDropdown: React.FC<{
  entry: ApplicationIpWhitelistEntry
  onRefreshApplicationSettings: () => Promise<unknown>
}> = ({ entry, onRefreshApplicationSettings }) => {
  const [editModalOpen, setEditModalOpen] = useState(false)

  return (
    <>
      <ConditionalDropdown
        menu={useIpEntryActionsMenu({
          entry,
          onEdit: () => setEditModalOpen(true),
          onRefreshApplicationSettings,
        })}
      />
      {editModalOpen && (
        <EditIpWhiteListModal
          entry={entry}
          close={() => setEditModalOpen(false)}
        />
      )}
    </>
  )
}

interface IpEntryActionsMenuParams {
  entry: ApplicationIpWhitelistEntry
  onEdit: () => void
  onRefreshApplicationSettings: () => Promise<unknown>
}

const useIpEntryActionsMenu = ({
  entry,
  onEdit,
  onRefreshApplicationSettings,
}: IpEntryActionsMenuParams): MenuProps => {
  const { message } = App.useApp()
  const { resource } = useResourceContext<ApplicationIpWhitelistEntry>()

  const handleDelete = async () => {
    try {
      await resource.removeResource(entry.id)
      await onRefreshApplicationSettings()
      message.success(I18n.t('admin.application_settings_ip_deleted_successfully'))
    } catch {
      message.error(I18n.t('common.errors.something_wrong'))
    }
  }

  const menuItems: MenuItem[] = [
    {
      key: 'edit',
      label: I18n.t('shared.edit'),
      onClick: onEdit,
    },
    {
      key: 'delete',
      label: I18n.t('shared.delete'),
      onClick: handleDelete,
    },
  ]

  return { items: menuItems }
}
