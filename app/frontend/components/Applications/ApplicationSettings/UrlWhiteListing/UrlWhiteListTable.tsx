import React, { useState } from 'react'
import {
  App, MenuProps, Switch,
} from 'antd'
import { ApplicationUrlWhitelistEntry } from '~/modules/admin/modules/client/core/applicationUrlWhitelistEntries'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { MenuItem } from '~/interfaces/Antd'
import { EditUrlWhiteListModal } from './EditUrlWhiteListModal'

const { I18n } = window

type Props = {
  onUrlWhitelistingEnabledChange: (enabled: boolean) => void
  onRefreshApplicationSettings: () => Promise<unknown>
}

export const UrlWhiteListTable: React.FC<Props> = ({
  onUrlWhitelistingEnabledChange,
  onRefreshApplicationSettings,
}) => (
  <Resource.Table pagination>
    <Resource.Column<ApplicationUrlWhitelistEntry>
      title={I18n.t('shared.id')}
      id="id"
      dataIndex="id"
      sorter
    />
    <Resource.Column<ApplicationUrlWhitelistEntry>
      title={I18n.t('admin.application_settings_url')}
      id="url"
      dataIndex="url"
      render={(_, entry) => entry.url}
    />
    <Resource.Column<ApplicationUrlWhitelistEntry>
      title={I18n.t('shared.status')}
      id="enabled"
      dataIndex="enabled"
      render={(_, entry) => (
        <UrlEntryStatusSwitch
          entry={entry}
          onUrlWhitelistingEnabledChange={onUrlWhitelistingEnabledChange}
        />
      )}
    />
    <Resource.Column<ApplicationUrlWhitelistEntry>
      title={I18n.t('shared.description')}
      id="description"
      dataIndex="description"
      render={(_, entry) => entry.description || '-'}
    />
    <Resource.Column<ApplicationUrlWhitelistEntry>
      title={I18n.t('shared.actions')}
      id="actions"
      render={(_, entry) => (
        <UrlEntryActionsDropdown
          entry={entry}
          onRefreshApplicationSettings={onRefreshApplicationSettings}
        />
      )}
    />
  </Resource.Table>
)

const UrlEntryStatusSwitch: React.FC<{
  entry: ApplicationUrlWhitelistEntry
  onUrlWhitelistingEnabledChange: (enabled: boolean) => void
}> = ({ entry, onUrlWhitelistingEnabledChange }) => {
  const { resource } = useResourceContext<ApplicationUrlWhitelistEntry>()

  const handleChange = async (checked: boolean) => {
    const result = await resource.updateResource({ id: entry.id, enabled: checked })
    onUrlWhitelistingEnabledChange(result.urlWhitelistingEnabled)
  }

  return (
    <Switch
      checked={entry.enabled}
      loading={resource.isLoading(`update@${entry.id}`)}
      onChange={handleChange}
    />
  )
}

const UrlEntryActionsDropdown: React.FC<{
  entry: ApplicationUrlWhitelistEntry
  onRefreshApplicationSettings: () => Promise<unknown>
}> = ({ entry, onRefreshApplicationSettings }) => {
  const [editModalOpen, setEditModalOpen] = useState(false)

  return (
    <>
      <ConditionalDropdown
        menu={useUrlEntryActionsMenu({
          entry,
          onEdit: () => setEditModalOpen(true),
          onRefreshApplicationSettings,
        })}
      />
      {editModalOpen && (
        <EditUrlWhiteListModal
          entry={entry}
          close={() => setEditModalOpen(false)}
        />
      )}
    </>
  )
}

interface UrlEntryActionsMenuParams {
  entry: ApplicationUrlWhitelistEntry
  onEdit: () => void
  onRefreshApplicationSettings: () => Promise<unknown>
}

const useUrlEntryActionsMenu = ({
  entry,
  onEdit,
  onRefreshApplicationSettings,
}: UrlEntryActionsMenuParams): MenuProps => {
  const { message } = App.useApp()
  const { resource } = useResourceContext<ApplicationUrlWhitelistEntry>()

  const handleDelete = async () => {
    try {
      await resource.removeResource(entry.id)
      await onRefreshApplicationSettings()
      message.success(I18n.t('admin.application_settings_url_deleted_successfully'))
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
