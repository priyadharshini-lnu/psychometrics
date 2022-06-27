import React from 'react'
import {
  Button, Menu, message,
} from 'antd'
import User from 'modules/admin/modules/campaigns/interfaces/User'
import { ToolOutlined, DownOutlined } from '@ant-design/icons'
import ConditionalDropdown from 'components/ConditionalDropdown'

const { I18n } = window

const menu = ({
  campaignId,
  openModal,
  permissions,
  onExport,
  onUserExport,
  onCompactExport,
}) => (
  <Menu>
    {permissions.exportCompletionStatus && (
      <Menu.ItemGroup title="Export Completion Status">
        <Menu.Item key="export_completion" onClick={() => onExport()}>
          {I18n.t('user.toolbar.export_detailed_completion_status')}
        </Menu.Item>
        <Menu.Item key="export_completion" onClick={() => onCompactExport()}>
          {I18n.t('user.toolbar.export_compact_completion_status')}
        </Menu.Item>
      </Menu.ItemGroup>
    )}
    <Menu.Divider />
    {permissions.exportUsers && (
      <Menu.Item key="export" onClick={() => onUserExport()}>
        {I18n.t('user.toolbar.export')}
      </Menu.Item>
    )}
    {permissions.import && (
      <Menu.Item key="import">
        <a onClick={() => openModal('ImportUsersModal', { campaignId })}>{I18n.t('user.toolbar.import')}</a>
      </Menu.Item>
    )}
  </Menu>
)

interface Props {
  campaignId: number
  openModal(name: string, data?: { campaignId: string, user?: User }): void
  exportCompletionStatuses(campaignId: number): Promise<void>
  exportUsers(campaignId: number): Promise<void>
  exportCompactCompletionStatuses(campaignId: number): Promise<void>
  permissions: {
    exportUsers: boolean,
    exportCompletionStatus: boolean,
    import: boolean,
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

  const onUserExport = () => {
    exportUsers(campaignId).then(() => {
      message.success(I18n.t('frontend.campaign.users.actions.export.scheduled'))
    })
  }

  const onCompactExport = () => {
    exportCompactCompletionStatuses(campaignId).then(() => {
      message.success(I18n.t('campaign_assessment.messages.export_completion_statuses_scheduled'))
    })
  }

  return (
    <ConditionalDropdown
      menu={menu({
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
