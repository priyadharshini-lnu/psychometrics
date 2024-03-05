import React from 'react'
import {
  Button, MenuProps, message,
} from 'antd'
import { ToolOutlined, DownOutlined } from '@ant-design/icons'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import User from '~/modules/admin/modules/campaigns/interfaces/User'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { ExportUsers, exportUsers } from '~/modules/admin/modules/campaigns/core/users'

const { I18n } = window

const getMenuProps = ({
  campaignId,
  openModal,
  permissions,
  onExport,
  onUserExport,
  onCompactExport,
}): MenuProps => {
  const menuItems: ItemType[] = []
  const exportMenuItems = [
    { key: 'export_completion', label: I18n.t('user.toolbar.export_detailed_completion_status') },
    { key: 'export_compact_completion', label: I18n.t('user.toolbar.export_compact_completion_status') },
  ]
  permissions.exportCompletionStatus && menuItems.push({
    type: 'group',
    key: 'completion_group',
    label: 'Export Completion Status',
    children: exportMenuItems,
  })
  menuItems.push({ type: 'divider' })
  permissions.exportUsers && menuItems.push({
    key: 'export',
    label: I18n.t('user.toolbar.export'),
  })
  permissions.import && menuItems.push({
    key: 'import',
    label: I18n.t('user.toolbar.import'),
  })

  permissions.import && menuItems.push({
    key: 'import_reports',
    label: I18n.t('user.toolbar.import_reports'),
  })


  const handleMenuClick = ({ key }) => {
    if (key === 'export_completion') {
      return onExport()
    }
    if (key === 'export_compact_completion') {
      return onCompactExport()
    }
    if (key === 'export') {
      return onUserExport()
    }
    if (key === 'import_reports') {
      return openModal('ImportReportsAndAssessmentsModal', { campaignId })
    }
    if (key === 'import') {
      return openModal('ImportUsersModal', { campaignId })
    }
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}

interface Props {
  campaignId: number
  openModal(name: string, data?: { campaignId: number, user?: User, exportUsers: ExportUsers }): void
  exportCompletionStatuses(campaignId: number): Promise<void>
  exportUsers: ExportUsers
  exportCompactCompletionStatuses(campaignId: number): Promise<void>
  permissions: {
    exportUsers: boolean,
    exportCompletionStatus: boolean,
    import: boolean,
    exportSignInUrl: boolean,
  }
}

const ToolsDropdown: React.FC<Props> = ({
  campaignId, openModal, permissions, exportCompletionStatuses, exportCompactCompletionStatuses, exportUsers,
}) => {
  const onExport = () => {
    exportCompletionStatuses(campaignId).then(() => {
      message.success(I18n.t('campaign_assessment.messages.export_completion_statuses_scheduled'))
    })
  }

  const handleExportUsers = (campaignId, data?: { exportSignInUrl: boolean}) => (
    exportUsers(campaignId, data).then(() => {
      message.success(I18n.t('frontend.campaign.users.actions.export.scheduled'))
    })
  )

  const onUserExport = () => {
    if (permissions.exportSignInUrl) {
      openModal('ExportUsersModal', { campaignId, exportUsers: handleExportUsers })
    } else {
      handleExportUsers(campaignId, { exportSignInUrl: false })
    }
  }

  const onCompactExport = () => {
    exportCompactCompletionStatuses(campaignId).then(() => {
      message.success(I18n.t('campaign_assessment.messages.export_completion_statuses_scheduled'))
    })
  }

  return (
    <ConditionalDropdown
      menu={getMenuProps({
        campaignId,
        openModal,
        permissions,
        onExport,
        onUserExport,
        onCompactExport,
      })}
      innerElement={(
        <Button>
          <ToolOutlined />
          <span>Tools</span>
          <DownOutlined />
        </Button>
    )}
      className="mrm"
      hideForEmptyMenu
    />
  )
}

export default ToolsDropdown
