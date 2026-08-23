import React, { FC, useState, useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Row, Col, Table, Switch, Space, Button, Divider, Empty, Tooltip,
} from 'antd'
import { ColumnsType } from 'antd/es/table'
import {
  SortableContainerProps, SortEnd, SortableContainer, SortableElement, SortableHandle,
} from 'react-sortable-hoc'
import { arrayMove } from '@dnd-kit/sortable'
import { PlusOutlined, MenuOutlined, InfoCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { RootState } from '~/modules/admin/core/rootReducers'
import { RemoveColumns } from './components/RemoveColumns'
import {
  get as getColumns, updateColumn, updateSorting, fetch, MAX_LENGTH_FOR_DASHBOARD_USE,
} from './core/columnDefinitions'
import { AddFieldDrawer } from './components/AddFieldDrawer'
import { ParentResourceType } from './interfaces'
import { EMAIL, Column, SheetType } from './core/list'
import { get as getPermissions } from './core/permissions'
import { toReadableString } from '~/modules/admin/modules/SheetManagement/utils'

const { I18n } = window

interface OwnProps {
  parentResourceType: ParentResourceType
  parentResourceId: number
  sheetType: SheetType
}

const connector = connect(
  (state: RootState, { parentResourceType, parentResourceId, sheetType }: OwnProps) => {
    const sheet = { parentType: parentResourceType, parentId: parentResourceId, sheetType }

    return {
      permissions: getPermissions(state, sheet),
      columns: getColumns(state, sheet),
    }
  },
  {
    fetch,
    updateColumn,
    updateSorting,
  },
)

type PropsFromRedux = OwnProps & ConnectedProps<typeof connector>

const DragHandle = SortableHandle(() => <MenuOutlined style={{ cursor: 'grab', color: '#999' }} />)

const SortableItem = SortableElement((props: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr {...props} />
))
const SortableBody = SortableContainer((props: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody {...props} />
))

export const SheetSettingsComponent: FC<PropsFromRedux> = ({
  columns: data, parentResourceType, parentResourceId, permissions, updateColumn, updateSorting, sheetType, fetch,
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
  const [drawer, setDrawer] = useState(false)
  const [sort, setSort] = useState(false)
  const [dataSource, setDataSource] = useState(data)

  useEffect(() => {
    fetch(parentResourceType, parentResourceId, sheetType)
  }, [])

  useEffect(() => {
    setDataSource(data)
  }, [data])

  const changeColumn = (column, field, value) => {
    updateColumn(parentResourceType, parentResourceId, sheetType, { ...column, [field]: value })
  }

  const onSortEnd = ({ oldIndex, newIndex }: SortEnd) => {
    if (oldIndex !== newIndex) {
      const newData = arrayMove(dataSource, oldIndex, newIndex).filter(
        (el: Column) => !!el,
      )
      setDataSource(newData)
    }
  }

  const updateOrder = () => {
    if (!sort) { return setSort(true) }

    updateSorting(parentResourceType, parentResourceId, sheetType, dataSource)
    setSort(false)
  }

  const columns:ColumnsType<Column> = [
    {
      title: 'Name',
      dataIndex: 'name',
    }, {
      title: 'Type',
      dataIndex: 'columnType',
      render: (title, data) => toReadableString(data.columnType),
    },
    {
      title: 'Action',
      render: (title, data) => {
        const notAllowedForDashboardUse = (data.name?.length || 0) > MAX_LENGTH_FOR_DASHBOARD_USE
        return (
          <Space>
            {sheetType === SheetType.Datasheet
               && (
                 <>
                   <Switch
                     disabled={sort}
                     checked={data.accessorAccess}
                     onChange={value => changeColumn(data, 'accessorAccess', value)}
                   />
                   {I18n.t('activemodel.attributes.sheet_column.accessor_access')}
                   <Switch
                     disabled={sort || data.name === EMAIL || notAllowedForDashboardUse}
                     checked={data.dashboardUse}
                     onChange={value => changeColumn(data, 'dashboardUse', value)}
                   />
                   {I18n.t('activemodel.attributes.sheet_column.dashboard_use')}
                   {notAllowedForDashboardUse && (
                     <Tooltip
                       placement="top"
                       title={I18n.t('admin.sheets_column_not_allowed_for_dashboard_use')}
                     >
                       <span><InfoCircleOutlined /></span>
                     </Tooltip>
                   )}
                 </>
               )
             }
            <Switch
              disabled={sort || data.name === EMAIL}
              checked={data.visibleInList}
              onChange={value => changeColumn(data, 'visibleInList', value)}
            />
            {I18n.t('activemodel.attributes.sheet_column.visible_in_list')}
          </Space>
        )
      },
    },
  ]
  if (sort) {
    columns.unshift({
      title: 'Sort',
      dataIndex: 'sort',
      width: 30,
      render: (title, data) => (data.name === EMAIL ? null : <DragHandle />),
    })
  }

  const DraggableContainer = (props: SortableContainerProps) => (
    <SortableBody
      useDragHandle
      lockAxis="y"
      disableAutoscroll
      helperClass="row-dragging"
      onSortEnd={onSortEnd}
      {...props}
    />
  )

  const DraggableRow: React.FC<{}> = ({ ...restProps }) => {
    const index = dataSource.findIndex(x => x.name === restProps['data-row-key'])
    return restProps['data-row-key'] === EMAIL
      ? <tr {...restProps} />
      : <SortableItem index={index} {...restProps} />
  }

  if (!data.length) {
    return (
      <Empty description={I18n.t('sheet.no_sheet')} className="p-10" />
    )
  }

  return (
    <div>
      <Row justify="space-between" className="pt-4 pb-4 ps-4 pe-4">
        {permissions.update && (
          <Col>
            <Button type="primary" danger={sort} onClick={() => updateOrder()}>
              {sort
                ? I18n.t('admin.sheets_column_save_order')
                : I18n.t('admin.sheets_column_reorder')}
            </Button>
          </Col>
        )}
        <Col>
          <Space>
            <RemoveColumns
              selectedRowKeys={sort ? [] : selectedRowKeys}
              setSelectedRowKeys={setSelectedRowKeys}
              permissions={permissions}
              parentResourceType={parentResourceType}
              parentResourceId={parentResourceId}
              sheetType={sheetType}
            />
            <Divider orientation="vertical" />
            {permissions.update && (
              <Button
                type="primary"
                onClick={() => setDrawer(true)}
              >
                <PlusOutlined />
                {I18n.t('admin.sheets_column_add_column')}
              </Button>
            )}
          </Space>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Table
            columns={columns}
            dataSource={dataSource}
            rowKey={row => (sort ? row.name || '' : row.id)}
            pagination={false}
            rowSelection={sort ? undefined : {
              selectedRowKeys,
              onChange: (rowKey: string[]) => setSelectedRowKeys(rowKey),
              getCheckboxProps: (record: Column) => ({
                disabled: record.name === EMAIL,
                style: record.name === EMAIL ? { visibility: 'hidden' } : {},
                name: record.name || '',
              }),
            }}
            components={!sort ? undefined : {
              body: {
                wrapper: DraggableContainer,
                row: DraggableRow,
              },
            }}
          />
        </Col>
      </Row>
      <AddFieldDrawer
        isOpen={drawer}
        toggleDrawer={() => setDrawer(!drawer)}
        parentResourceType={parentResourceType}
        parentResourceId={parentResourceId}
        sheetType={sheetType}
      />
    </div>
  )
}

export const SheetSettings = connector(SheetSettingsComponent)
