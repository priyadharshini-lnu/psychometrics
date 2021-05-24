import React, { FC } from 'react'
import {
  Dropdown, Button, Menu, message,
} from 'antd'
import { ToolOutlined, DownOutlined } from '@ant-design/icons'
import { openModal } from 'modules/admin/core/ui/modals'
import ConditionalDropdown from 'components/ConditionalDropdown'
import { connect, ConnectedProps } from 'react-redux'
import pluralize from 'pluralize'
import { ParentResourceType } from '../interfaces'

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
  datasheetCount: number
  permissions: {
    export: boolean
    import: boolean
  }
}

type Props = PropsFromRedux & OwnProps

const { I18n } = window

const ToolsDropdown: FC<Props> = ({
  parentType, parentId, datasheetCount, openModal, permissions,
}) => {
  const handleExport = (e) => {
    if (datasheetCount <= 0) {
      message.info(I18n.t('datasheet.menu.export_info'))
      e.preventDefault()
    }
  }

  const toolsMenu = (
    <Menu>
      {permissions.import && (
        <Menu.Item
          key="import"
          onClick={() => openModal('ImportDatasheetModal', { parentType, parentId })}
        >
          {I18n.t('datasheet.menu.import')}
        </Menu.Item>
      )}
      {permissions.export && (
        <Menu.Item key="export">
          <a
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleExport}
            href={`/administration/${pluralize(parentType)}/${parentId}/datasheet_rows/export.xlsx`}
          >
            {I18n.t('datasheet.menu.export')}
          </a>
        </Menu.Item>
      )}
    </Menu>
  )

  const toolsDropdown = (
    <Dropdown overlay={toolsMenu} trigger={['click']}>
      <Button>
        <ToolOutlined />
        <DownOutlined />
      </Button>
    </Dropdown>
  )

  return (
    <ConditionalDropdown
      menu={toolsMenu}
      dropdown={toolsDropdown}
    />
  )
}

export default connector(ToolsDropdown)
