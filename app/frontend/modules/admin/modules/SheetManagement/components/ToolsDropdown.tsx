import React, { FC } from 'react'
import {
  Button, Menu, message,
} from 'antd'
import { ToolOutlined, DownOutlined } from '@ant-design/icons'
import { openModal } from 'modules/admin/core/ui/modals'
import ConditionalDropdown from 'components/ConditionalDropdown'
import { connect, ConnectedProps } from 'react-redux'
import pluralize from 'pluralize'
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

  const toolsMenu = (
    <Menu>
      {permissions.import && (
        <Menu.Item
          key="import"
          onClick={() => openModal('ImportSheetModal', { parentType, parentId, sheetType })}
        >
          {I18n.t('sheet.menu.import')}
        </Menu.Item>
      )}
      {permissions.export && (
        <Menu.Item key="export">
          <a
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleExport}
            href={`/administration/${pluralize(parentType)}/${parentId}/sheet_rows/export.xlsx?type=${sheetType}`}
          >
            {I18n.t('sheet.menu.export')}
          </a>
        </Menu.Item>
      )}
    </Menu>
  )

  return (
    <ConditionalDropdown
      menu={toolsMenu}
      hideForEmptyMenu
      innerElement={(
        <Button>
          <ToolOutlined />
          <DownOutlined />
        </Button>
      )}
    />
  )
}

export default connector(ToolsDropdown)
