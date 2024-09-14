import { FC, useMemo, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import isEmpty from 'lodash/isEmpty'
import {
  Table,
  Row,
  Col,
  Space,
  Button,
  Input,
  Pagination,
  Divider,
  Empty,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'

import withEnhancedTable from '~/modules/admin/hoc/withEnhancedTable'
import { toReadableString } from '~/modules/admin/modules/SheetManagement/utils'

import {
  get,
  fetch,
  FETCH as FETCH_SHEET,
  SheetType,
} from '~/modules/admin/modules/SheetManagement/core/list'
import { get as getTotal } from '~/modules/admin/modules/SheetManagement/core/total'
import { get as getPermissions } from '~/modules/admin/modules/SheetManagement/core/permissions'
import {
  get as getColumns,
  getVisibleColumnNames,
} from '~/modules/admin/modules/SheetManagement/core/columnDefinitions'

import { RootState } from '~/modules/admin/core/rootReducers'
import { TableProps } from '~/modules/admin/hoc/withEnhancedTable/interfaces'
import {
  DrawerModes,
  ParentResourceType,
} from '~/modules/admin/modules/SheetManagement/interfaces'

import { COLUMN_ID_EMAIL } from '~/modules/admin/modules/SheetManagement/constants'
import settings from '~/modules/admin/settings'

import Modals from '~/modules/admin/components/Modals/'

import { SelectionActions } from '~/modules/admin/modules/SheetManagement/components/SelectionActions'
import ToolsDropdown from '~/modules/admin/modules/SheetManagement/components/ToolsDropdown'
import { DetailsDrawer } from '~/modules/admin/modules/SheetManagement/components/DetailsDrawer'
import { AddEditDrawer } from '~/modules/admin/modules/SheetManagement/components/AddEditDrawer'
import { ImportSheetModal } from '~/modules/admin/modules/SheetManagement/components/ImportSheetModal'
import { useDeepCompareEffect } from '~/hooks/useDeepCompareEffect'
import { CountDisplay } from '~/components/CountDisplay'
import { isRequestInProgress } from '~/core/request'

const { I18n } = window

const connector = connect(
  (state: RootState) => ({
    list: get(state),
    isListLoading: isRequestInProgress(state, FETCH_SHEET),
    total: getTotal(state),
    permissions: getPermissions(state),
    columnDefinitions: getColumns(state),
    visibleColumns: getVisibleColumnNames(state),
  }),
  {
    fetch,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>

interface OwnProps {
  parentResourceType: ParentResourceType
  parentResourceId: number
  sheetType?: SheetType
}

type Props = OwnProps & PropsFromRedux & TableProps

const MODALS = {
  ImportSheetModal,
}

const SheetComponent: FC<Props> = ({
  list,
  isListLoading,
  total,
  permissions,
  columnDefinitions,
  parentResourceType,
  parentResourceId,
  tableConfig: { filters, page },
  tableConfig,
  changeFilter,
  changePage,
  fetch,
  visibleColumns,
  sheetType = SheetType.Datasheet,
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])

  const [activeDrawerIs, setDrawerTo] = useState<DrawerModes>(DrawerModes.None)
  const [currentSheetRowId, setCurrentSheetId] = useState('')

  const allColumns = useMemo(
    () => columnDefinitions
      .map((filteredColumn) => {
        if (filteredColumn.name === COLUMN_ID_EMAIL) {
          return {
            title: 'Email',
            dataIndex: filteredColumn.name,
            render: (text: string, { id }) => (
              <Button
                type="link"
                onClick={() => toggleDrawer(DrawerModes.Details, id)}
                className="ps-0"
              >
                {text}
              </Button>
            ),
          }
        }
        return {
          title: toReadableString(filteredColumn.name || ''),
          dataIndex: filteredColumn.name || '',
        }
      }),
    [columnDefinitions],
  )

  const visibleColumnsDefinition = useMemo(
    () => allColumns.filter(originalColumn => visibleColumns.includes(originalColumn.dataIndex)),
    [columnDefinitions],
  )

  useDeepCompareEffect(() => {
    if (parentResourceId === undefined) { return }

    fetch(parentResourceType, parentResourceId, sheetType, tableConfig)
  }, [tableConfig])

  const toggleDrawer = (mode: DrawerModes, id = '') => {
    setDrawerTo(mode)
    setCurrentSheetId(id)
  }

  const isSheetUploaded = !isEmpty(columnDefinitions) && columnDefinitions.length > 1

  return (
    <>
      <Row justify="space-between" className="pt-4 pb-4 ps-4 pe-4">
        <Col>
          {isSheetUploaded && (
          <CountDisplay
            selectedCount={selectedRowKeys.length}
            totalCount={total}
            isLoading={isListLoading}
          />
          )}
        </Col>
        <Col>
          <Space>
            <SelectionActions
              selectedRowKeys={selectedRowKeys}
              setSelectedRowKeys={setSelectedRowKeys}
              toggleDrawer={toggleDrawer}
              permissions={permissions}
              parentResourceType={parentResourceType}
              parentResourceId={parentResourceId}
              sheetType={sheetType}
            />
            <Divider type="vertical" />
            <Input.Search
              placeholder={I18n.t(
                'administration.sheets.list.header.search_record',
              )}
              value={filters.emailCont}
              onChange={e => changeFilter('emailCont', e.target.value)}
            />
            <ToolsDropdown
              parentId={parentResourceId}
              parentType={parentResourceType}
              sheetRowsCount={total}
              permissions={permissions}
              sheetType={sheetType}
            />
            {permissions.add && isSheetUploaded && (
              <Button
                type="primary"
                onClick={() => toggleDrawer(DrawerModes.Add)}
                disabled={isListLoading}
              >
                <PlusOutlined />
                {I18n.t('administration.sheets.list.header.add_record')}
              </Button>
            )}
          </Space>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          {isSheetUploaded ? (
            <Table
              loading={isListLoading}
              columns={visibleColumnsDefinition}
              dataSource={list}
              rowKey={row => row.id}
              pagination={false}
              rowSelection={{
                selectedRowKeys,
                onChange: (rowKey: string[]) => setSelectedRowKeys(rowKey),
              }}
            />
          ) : <Empty />}
        </Col>
      </Row>
      <Row className="pt-4 pb-4 ps-4 pe-4">
        <Col>
          <Pagination
            current={page}
            pageSize={settings.pagination.defaultPageSize}
            total={total}
            onChange={changePage}
            hideOnSinglePage
          />
        </Col>
      </Row>
      {permissions.view && (
        <DetailsDrawer
          isOpen={activeDrawerIs === DrawerModes.Details}
          toggleDrawer={toggleDrawer}
          editPermission={permissions.edit}
          currentSheetRowId={currentSheetRowId}
          parentResourceType={parentResourceType}
          parentResourceId={parentResourceId}
          sheetType={sheetType}
        />
      )}
      <AddEditDrawer
        isOpen={
          activeDrawerIs === DrawerModes.Edit
          || activeDrawerIs === DrawerModes.Add
        }
        toggleDrawer={toggleDrawer}
        currentSheetRowId={currentSheetRowId}
        mode={activeDrawerIs}
        parentResourceType={parentResourceType}
        parentResourceId={parentResourceId}
        sheetType={sheetType}
      />
      <Modals modals={MODALS} />
    </>
  )
}

export const Sheet = withEnhancedTable<OwnProps>(
  connector(SheetComponent),
  'sheet',
  {
    maintainHistory: true,
  },
)
