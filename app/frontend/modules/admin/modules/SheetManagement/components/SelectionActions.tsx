import { Dispatch, FC, SetStateAction } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Button, Space, Badge, App,
} from 'antd'
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'

import {
  fetch,
  bulkDelete,
  SheetType,
} from '~/modules/admin/modules/SheetManagement/core/list'
import settings from '~/modules/admin/settings'
import {
  DrawerModes,
  ParentResourceType,
} from '~/modules/admin/modules/SheetManagement/interfaces'
import { getTableConfigs } from '~/modules/admin/core/filterAndPagination/selectors'
import { RootState } from '~/modules/reports/core/rootReducers'

const { I18n } = window

const connector = connect(
  (state: RootState) => ({
    tableConfigs: getTableConfigs('sheet', state),
  }), {
    fetch,
    bulkDelete,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>

interface OwnProps {
  selectedRowKeys: string[]
  toggleDrawer: (drawer: DrawerModes, id: string) => void
  parentResourceType: ParentResourceType
  parentResourceId: number
  setSelectedRowKeys: Dispatch<SetStateAction<string[]>>
  permissions: {
    update: boolean
    delete: boolean
  }
  sheetType: SheetType
}

type Props = PropsFromRedux & OwnProps

const SelectionActionsComponent: FC<Props> = ({
  selectedRowKeys,
  setSelectedRowKeys,
  toggleDrawer,
  parentResourceType,
  parentResourceId,
  permissions,
  bulkDelete,
  fetch,
  tableConfigs,
  sheetType,
}) => {
  const { modal, message } = App.useApp()
  if (selectedRowKeys.length === 0) {
    return null
  }

  const selectedCount = selectedRowKeys.length
  const badgeCount = selectedCount === 0 || selectedCount === 1 ? 0 : selectedCount

  const handleBatchDelete = async (): Promise<void> => {
    await bulkDelete(parentResourceType, parentResourceId, sheetType, selectedRowKeys)
    setSelectedRowKeys([])
    fetch(parentResourceType, parentResourceId, sheetType, tableConfigs)
    message.success(
      I18n.t('admin.sheets_modals_delete_records_successMessage', {
        count: selectedCount,
      }),
    )
  }

  const openConfirmModalForDelete = (): void => {
    modal.confirm({
      title: I18n.t('admin.sheets_modals_delete_records_title', {
        count: selectedCount,
      }),
      content: I18n.t(
        'admin.sheets_modals_delete_records_content',
        { count: selectedCount },
      ),
      icon: <ExclamationCircleOutlined />,
      okText: I18n.t('admin.sheets_modals_delete_records_okText'),
      okType: 'danger',
      cancelText: I18n.t(
        'admin.sheets_modals_delete_records_cancelText',
      ),
      onOk: handleBatchDelete,
    })
  }

  return (
    <Space>
      {permissions.update && selectedRowKeys.length === 1 && (
        <Button
          onClick={() => toggleDrawer(DrawerModes.Edit, selectedRowKeys[0])}
        >
          <EditOutlined />
        </Button>
      )}
      {permissions.delete && (
        <Badge
          count={badgeCount}
          overflowCount={settings.pagination.defaultPageSize}
        >
          <Button danger onClick={openConfirmModalForDelete}>
            <DeleteOutlined />
          </Button>
        </Badge>
      )}
    </Space>
  )
}

export const SelectionActions = connector(SelectionActionsComponent)
