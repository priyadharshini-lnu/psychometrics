import React from 'react'
import {
  Button, MenuProps, message,
} from 'antd'
import { ToolOutlined, DownOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { MenuItem } from '~/interfaces/Antd'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { ExportUsers } from '~/modules/admin/modules/campaigns/core/users'

const { I18n } = window

const getMenuProps = ({
  campaignId,
  openModal,
  permissions,
  onExport,
  onUserExport,
  onCompactExport,
  onExportReportsAndAssessments,
}): MenuProps => {
  const menuItems: MenuItem[] = []
  const exportMenuItems = [
    { key: 'export_completion', label: I18n.t('user.toolbar.export_detailed_completion_status') },
    { key: 'export_compact_completion', label: I18n.t('user.toolbar.export_compact_completion_status') },
  ]
  permissions.exportCompletionStatus && menuItems.push({
    type: 'group',
    key: 'completion_group',
    label: I18n.t('campaign_assessment.actions.export_completion_status'),
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
  menuItems.push({ type: 'divider' })
  permissions.import && menuItems.push({
    key: 'import_reports',
    label: I18n.t('user.toolbar.import_reports'),
  })

  permissions.import && menuItems.push({
    key: 'export_reports_and_assessments',
    label: I18n.t('user.toolbar.export_reports_and_assessments'),
  })
  menuItems.push({ type: 'divider' })
  permissions.bulkDownloadIdpReports && menuItems.push({
    key: 'bulk_download_idp_reports',
    label: I18n.t('user.toolbar.bulk_download_idp_reports'),
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
    if (key === 'import') {
      return openModal('ImportUsersModal', { campaignId })
    }
    if (key === 'import_reports') {
      return openModal('ImportReportsAndAssessmentsModal', { campaignId })
    }
    if (key === 'export_reports_and_assessments') {
      return onExportReportsAndAssessments(campaignId)
    }

    if (key === 'bulk_download_idp_reports') {
      return openModal('BulkDownloadIdpReports', {
        campaignId, allowReflectionQuestions: permissions.allowIncludeReflectiveQuestions,
      })
    }
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}

interface Props {
  campaignId: number
  openModal(name: string, data?: object): void
  exportCompletionStatuses(campaignId: number, body: object): Promise<void>
  exportUsers: ExportUsers
  exportCompactCompletionStatuses(campaignId: number, body: object): Promise<void>
  exportReportsAndAssessments(campaignId: number): Promise<void>
  permissions: {
    exportUsers: boolean,
    exportCompletionStatus: boolean,
    import: boolean,
    exportSignInUrl: boolean,
  }
}

const ToolsDropdown: React.FC<Props> = ({
  campaignId, openModal, permissions, exportCompletionStatuses, exportCompactCompletionStatuses, exportUsers,
  exportReportsAndAssessments,
}) => {
  const onExport = () => {
    openModal('UserFilterModal', {
      id: campaignId,
      action: exportCompletionStatuses,
      onSuccess: () => { message.success(I18n.t('campaign_assessment.messages.export_completion_statuses_scheduled')) },
    })
  }

  const handleExportUsers = (campaignId, data?: { exportSignInUrl: boolean}) => (
    exportUsers(campaignId, data).then(() => {
      message.success(I18n.t('frontend.campaign.users.actions.export.scheduled'))
    })
  )

  const onUserExport = () => {
    openModal('ExportUsersModal', {
      campaignId, exportUsers: handleExportUsers, permissions: { exportSignInUrl: permissions.exportSignInUrl },
    })
  }

  const onCompactExport = () => {
    openModal('UserFilterModal', {
      id: campaignId,
      action: exportCompactCompletionStatuses,
      onSuccess: () => { message.success(I18n.t('campaign_assessment.messages.export_completion_statuses_scheduled')) },
    })
  }

  const onExportReportsAndAssessments = (campaignId) => {
    exportReportsAndAssessments(campaignId).then(() => {
      message.success(I18n.t('campaign_assessment.messages.export_reports_and_assessments_statuses_scheduled'))
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
        onExportReportsAndAssessments,
      })}
      innerElement={(
        <Button>
          <ToolOutlined />
          <span>{I18n.t('shared.tools')}</span>
          <DownOutlined />
        </Button>
    )}
      className="mrm"
      hideForEmptyMenu
    />
  )
}

export default ToolsDropdown
