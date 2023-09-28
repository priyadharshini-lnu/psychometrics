import { FC } from 'react'
import {
  Button, Menu, message,
} from 'antd'
import { ToolOutlined, DownOutlined } from '@ant-design/icons'
import { connect, ConnectedProps } from 'react-redux'
import pluralize from 'pluralize'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
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
  const menuItems:ItemType[] = []
  permissions.import && menuItems.push({
    key: 'import',
    label: I18n.t('sheet.menu.import'),
  })
  permissions.export && menuItems.push({
    key: 'export',
    label: (
      <a
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleExport}
        href={`/administration/${pluralize(parentType)}/${parentId}/sheet_rows/export.xlsx?type=${sheetType}`}
      >
        {I18n.t('sheet.menu.export')}
      </a>
    ),
  })
  const handleMenuClick = ({ key }) => {
    if (key === 'import') {
      openModal('ImportSheetModal', { parentType, parentId, sheetType })
    }
  }

  const toolsMenu = (
    <Menu items={menuItems} onClick={handleMenuClick} />
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
