import React, { Dispatch, FC, SetStateAction } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Button, Space, Badge, Modal, message,
} from 'antd'
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'

import {
  fetch,
  batchDelete,
} from 'modules/admin/modules/DatasheetManagement/core/list'
import settings from 'modules/admin/settings'
import {
  DrawerModes,
  ParentResourceType,
} from 'modules/admin/modules/DatasheetManagement/interfaces'

const { I18n } = window

const connector = connect(null, {
  fetch,
  batchDelete,
})

type PropsFromRedux = ConnectedProps<typeof connector>

interface OwnProps {
  selectedRowKeys: string[]
  toggleDrawer: (drawer: DrawerModes, id: string) => void
  parentResourceType: ParentResourceType
  parentResourceId: number
  setSelectedRowKeys: Dispatch<SetStateAction<string[]>>
}

type Props = PropsFromRedux & OwnProps

const SelectionActionsComponent: FC<Props> = ({
  selectedRowKeys,
  setSelectedRowKeys,
  toggleDrawer,
  parentResourceType,
  parentResourceId,
  batchDelete,
  fetch,
}) => {
  if (selectedRowKeys.length === 0) {
    return null
  }

  const selectedCount = selectedRowKeys.length
  const badgeCount = selectedCount === 0 || selectedCount === 1 ? 0 : selectedCount

  const handleBatchDelete = async (): Promise<void> => {
    await batchDelete(parentResourceType, parentResourceId, selectedRowKeys)
    setSelectedRowKeys([])
    fetch(parentResourceType, parentResourceId)
    message.success(
      I18n.t('administration.datasheets.modals.delete_records.successMessage', {
        count: selectedCount,
      }),
    )
  }

  const openConfirmModalForDelete = (): void => {
    Modal.confirm({
      title: I18n.t('administration.datasheets.modals.delete_records.title', {
        count: selectedCount,
      }),
      content: I18n.t(
        'administration.datasheets.modals.delete_records.content',
        { count: selectedCount },
      ),
      icon: <ExclamationCircleOutlined />,
      okText: I18n.t('administration.datasheets.modals.delete_records.okText'),
      okType: 'danger',
      cancelText: I18n.t(
        'administration.datasheets.modals.delete_records.cancelText',
      ),
      onOk: handleBatchDelete,
    })
  }

  return (
    <Space>
      {selectedRowKeys.length === 1 && (
        <Button
          onClick={() => toggleDrawer(DrawerModes.Edit, selectedRowKeys[0])}
        >
          <EditOutlined />
        </Button>
      )}
      <Badge
        count={badgeCount}
        overflowCount={settings.pagination.defaultPageSize}
      >
        <Button danger onClick={openConfirmModalForDelete}>
          <DeleteOutlined />
        </Button>
      </Badge>
    </Space>
  )
}

export const SelectionActions = connector(SelectionActionsComponent)
