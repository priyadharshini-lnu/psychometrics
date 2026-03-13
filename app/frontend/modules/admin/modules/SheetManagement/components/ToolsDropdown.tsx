import { FC } from 'react'
import {
  Button, message,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import pluralize from 'pluralize'
import { ToolOutlined, DownOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { MenuItem } from '~/interfaces/Antd'
import { openModal } from '~/modules/admin/core/ui/modals'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { ParentResourceType } from '../interfaces'
import { SheetType } from '../core/list'

const connector = connect(
  null,
  {
    openModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>
interface OwnProps {
  parentType: ParentResourceType
  parentId: number
  sheetRowsCount: number
  permissions: {
    export: boolean
    import: boolean
  }
  sheetType: SheetType
}

type Props = PropsFromRedux & OwnProps

const { I18n } = window

const ToolsDropdown: FC<Props> = ({
  parentType, parentId, sheetRowsCount, openModal, permissions, sheetType,
}) => {
  const handleExport = (e) => {
    if (sheetRowsCount <= 0) {
      message.info(I18n.t('sheet.menu.export_info'))
      e.preventDefault()
    }
  }
  const isProjectDatasheetExport = parentType === ParentResourceType.Project && sheetType === SheetType.Datasheet
  const singleExportUrl = `/administration/${pluralize(parentType)}/${parentId}/sheet_rows/export.xlsx`
    + `?type=${sheetType}`

  const menuItems:MenuItem[] = []
  permissions.import && menuItems.push({
    key: 'import',
    label: I18n.t('sheet.menu.import'),
  })
  permissions.export && menuItems.push({
    key: 'export',
    label: isProjectDatasheetExport
      ? I18n.t('sheet.menu.export')
      : (
        <a
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleExport}
          href={singleExportUrl}
        >
          {I18n.t('sheet.menu.export')}
        </a>
      ),
  })

  const handleMenuClick = ({ key }) => {
    if (key === 'import') {
      openModal('ImportSheetModal', { parentType, parentId, sheetType })
    }
    if (key === 'export' && isProjectDatasheetExport) {
      const projectExportUrl = `/administration/${pluralize(parentType)}/${parentId}/sheet_rows/export`
        + `?type=${sheetType}&include_campaigns=true`
      fetch(projectExportUrl, {
        method: 'GET',
      }).then(() => message.success(I18n.t('admin.export_campaigns_queued')))
    }
  }

  return (
    <ConditionalDropdown
      menu={{ items: menuItems, onClick: handleMenuClick }}
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
