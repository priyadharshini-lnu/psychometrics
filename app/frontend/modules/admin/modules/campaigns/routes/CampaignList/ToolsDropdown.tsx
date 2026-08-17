import { FC } from 'react'
import {
  Button, message,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router-dom'
import { ToolOutlined, DownOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { MenuItem } from '~/interfaces/Antd'
import { getPermissions } from '~/core/currentUser'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { useResources } from '~/hooks/useResources/useResources'

const { I18n } = window

const connector = connect(
  state => ({
    permissions: getPermissions(state),
  }),
  {},
)

type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux & {
  openModal(name: string, data: object): void
}

const ToolsDropdown: FC<Props> = ({ permissions, openModal }) => {
  const { projectId } = useParams() as { projectId: string }
  const { memberAction } = useResources('projects')

  const menuItems:MenuItem[] = []
  permissions.workshopStatusExport && menuItems.push({
    key: 'workshopStatusExport',
    label: I18n.t('admin.project_tools_workshop_status_export'),
  })

  const exportMenuItems = [
    { key: 'exportCompletion', label: I18n.t('admin.export_detailed_completion_status') },
    { key: 'exportCompactCompletion', label: I18n.t('admin.export_compact_completion_status') },
  ]

  permissions.exportCompletionStatus && menuItems.push({
    type: 'group',
    key: 'completionGroup',
    label: I18n.t('admin.export_completion_status'),
    children: exportMenuItems,
  })

  permissions.canManageProject && menuItems.push({
    key: 'bulkImportTranslations',
    label: I18n.t('administration.campaigns.bulk_import_translations.menu_label'),
  })

  const exportWorkshopStatus = (id, body): Promise<unknown> => memberAction({
    id,
    action: 'workshop_status_export',
    body,
    method: 'post',
  })

  const exportCompletionStatus = (id, body): Promise<unknown> => memberAction({
    id,
    action: 'export_completion_status',
    body,
    method: 'post',
  })

  const exportCompactCompletionStatus = (id, body): Promise<unknown> => memberAction({
    id,
    action: 'export_compact_completion_status',
    body,
    method: 'post',
  })

  const handleMenuClick = ({ key }) => {
    if (key === 'workshopStatusExport') {
      openModal('UserFilterModal', {
        id: projectId,
        action: exportWorkshopStatus,
        onSuccess: () => { message.success(I18n.t('admin.project_tools_workshop_status_export_success')) },
      })
    }
    if (key === 'exportCompletion') {
      openModal('UserFilterModal', {
        id: projectId,
        action: exportCompletionStatus,
        onSuccess: () => message.success(I18n.t('admin.export_completion_statuses_scheduled')),
      })
    }
    if (key === 'exportCompactCompletion') {
      openModal('UserFilterModal', {
        id: projectId,
        action: exportCompactCompletionStatus,
        onSuccess: () => message.success(I18n.t('admin.export_completion_statuses_scheduled')),
      })
    }
    if (key === 'bulkImportTranslations') {
      openModal('BulkImportCampaignTranslationsModal', {
        projectId: Number(projectId),
      })
    }
  }

  const toolsMenu = {
    items: menuItems,
    onClick: handleMenuClick,
  }

  return (
    <ConditionalDropdown
      menu={toolsMenu}
      hideForEmptyMenu
      innerElement={(
        <Button>
          <ToolOutlined />
          <span>{I18n.t('shared.tools')}</span>
          <DownOutlined />
        </Button>
      )}
    />
  )
}

export default connector(ToolsDropdown)
