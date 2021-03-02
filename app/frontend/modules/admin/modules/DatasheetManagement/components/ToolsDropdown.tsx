import React, { FC } from 'react'
import { Dropdown, Button, Menu } from 'antd'
import { ToolOutlined, DownOutlined } from '@ant-design/icons'
import { openModal } from 'modules/admin/core/ui/modals'
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
}

type Props = PropsFromRedux & OwnProps

const { I18n } = window

const ToolsDropdown: FC<Props> = ({ parentType, parentId, openModal }) => {
  const toolsMenu = (
    <Menu>
      <Menu.Item key="import" onClick={() => openModal('ImportDatasheetModal', { parentType, parentId })}>
        {I18n.t('datasheet.menu.import')}
      </Menu.Item>
      <Menu.Item key="export">
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`/administration/${pluralize(parentType)}/${parentId}/datasheet_rows/export.xlsx`}
        >
          {I18n.t('datasheet.menu.export')}
        </a>
      </Menu.Item>
    </Menu>
  )

  return (
    <Dropdown overlay={toolsMenu} trigger={['click']}>
      <Button>
        <ToolOutlined />
        <DownOutlined />
      </Button>
    </Dropdown>
  )
}

export default connector(ToolsDropdown)
