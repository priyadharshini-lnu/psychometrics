import { Dispatch, FC, SetStateAction } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Button, Space, Badge, App,
} from 'antd'
import { DeleteOutlined, ExclamationCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

import settings from '~/modules/admin/settings'
import {
  ParentResourceType,
} from '~/modules/admin/modules/SheetManagement/interfaces'
import { getTableConfigs } from '~/modules/admin/core/filterAndPagination/selectors'
import { RootState } from '~/modules/reports/core/rootReducers'
import { removeColumns } from '../core/columnDefinitions'
import { SheetType } from '../core/list'

const { I18n } = window

const connector = connect(
  (state: RootState) => ({
    tableConfigs: getTableConfigs('sheet', state),
  }), {
    fetch,
    removeColumns,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>

interface OwnProps {
  selectedRowKeys: string[]
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

const RemoveColumnsComponent: FC<Props> = ({
  selectedRowKeys,
  setSelectedRowKeys,
  parentResourceType,
  parentResourceId,
  permissions,
  removeColumns,
  sheetType,
}) => {
  const { modal, message } = App.useApp()
  if (selectedRowKeys.length === 0) {
    return null
  }

  const selectedCount = selectedRowKeys.length
  const badgeCount = selectedCount === 0 || selectedCount === 1 ? 0 : selectedCount

  const handleBatchDelete = async (): Promise<void> => {
    await removeColumns(parentResourceType, parentResourceId, sheetType, selectedRowKeys)
    message.success(
      I18n.t('admin.sheets_modals_remove_columns_successMessage',
        { count: selectedCount, columns: selectedRowKeys.join(', ') }),
    )
    setSelectedRowKeys([])
  }

  const openConfirmModalForDelete = (): void => {
    modal.confirm({
      title: I18n.t('admin.sheets_modals_remove_columns_title', {
        count: selectedCount,
      }),
      content: I18n.t(
        'admin.sheets_modals_remove_columns_content',
        { count: selectedCount, columns: selectedRowKeys.join(', ') },
      ),
      icon: <ExclamationCircleOutlined />,
      okText: I18n.t('admin.sheets_modals_remove_columns_okText'),
      okType: 'danger',
      cancelText: I18n.t(
        'admin.sheets_modals_remove_columns_cancelText',
      ),
      onOk: handleBatchDelete,
    })
  }

  return (
    <Space>
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

export const RemoveColumns = connector(RemoveColumnsComponent)
