import { FC, useMemo, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import isEmpty from 'lodash/isEmpty'
import {
  Table,
  Space,
  Button,
  Input,
  Divider,
  Empty,
  GetProp,
  TableProps as AntTableProps,
} from 'antd'
import { useBreakpoint } from '@thetalententerprise/glint'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import withEnhancedTable from '~/modules/admin/hoc/withEnhancedTable'
import {
  DrawerModes,
  ParentResourceType,
} from '~/modules/admin/modules/SheetManagement/interfaces'
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

import { COLUMN_ID_EMAIL } from '~/modules/admin/modules/SheetManagement/constants'
import settings from '~/modules/admin/settings'

import Modals from '~/modules/admin/components/Modals/'
import { TableLayout } from '~/modules/admin/components/TableLayout'

import { SelectionActions } from '~/modules/admin/modules/SheetManagement/components/SelectionActions'
import ToolsDropdown from '~/modules/admin/modules/SheetManagement/components/ToolsDropdown'
import { DetailsDrawer } from '~/modules/admin/modules/SheetManagement/components/DetailsDrawer'
import { AddEditDrawer } from '~/modules/admin/modules/SheetManagement/components/AddEditDrawer'
import { ImportSheetModal } from '~/modules/admin/modules/SheetManagement/components/ImportSheetModal'
import { useDeepCompareEffect } from '~/hooks/useDeepCompareEffect'
import { isRequestInProgress } from '~/core/request'

type FixedType = GetProp<GetProp<AntTableProps, 'columns'>[number], 'fixed'>

const { I18n } = window

interface OwnProps {
  parentResourceType: ParentResourceType
  parentResourceId: number
  sheetType?: SheetType
}

const connector = connect(
  (state: RootState, { parentResourceType, parentResourceId, sheetType = SheetType.Datasheet }: OwnProps) => {
    const sheet = { parentType: parentResourceType, parentId: parentResourceId, sheetType }

    return {
      state,
      list: get(state, sheet),
      isListLoading: isRequestInProgress(state, FETCH_SHEET),
      total: getTotal(state, sheet),
      permissions: getPermissions(state, sheet),
      columnDefinitions: getColumns(state, sheet),
      visibleColumns: getVisibleColumnNames(state, sheet),
    }
  },
  {
    fetch,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>

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
  tableConfig: { filters, page, pageSize },
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
  const screens = useBreakpoint()
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
          title: filteredColumn.name || '',
          dataIndex: filteredColumn.name || '',
        }
      }),
    [columnDefinitions],
  )

  const getColBehaviour = (index: number, length: number): FixedType| undefined => {
    if (screens.md && (index === 0 || index === 1)) {
      return 'left'
    }
    if (index === length - 1 && screens.md) {
      return 'right'
    }
    return undefined
  }

  const visibleColumnsDefinition = useMemo(
    () => {
      const visCols = allColumns.filter(originalColumn => visibleColumns.includes(originalColumn.dataIndex))
      return visCols.map((originalColumn, index) => ({
        ...originalColumn,
        fixed: getColBehaviour(index, visCols.length),
      }))
    },
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
      <TableLayout
        loading={isListLoading}
        title={I18n.t('admin.sheets_tabs_rows')}
        recordCount={total}
        selectedCount={selectedRowKeys.length}
        pagination={{
          page,
          pageSize: pageSize ?? settings.pagination.defaultPageSize,
          total,
          onChange: changePage,
        }}
        filters={(
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
            <Divider orientation="vertical" />
            <Input.Search
              placeholder={I18n.t(
                'admin.sheets_list_header_search_record',
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
                {I18n.t('admin.sheets_list_header_add_record')}
              </Button>
            )}
          </Space>
        )}
        table={isSheetUploaded ? (
          <Table
            columns={visibleColumnsDefinition}
            dataSource={list}
            rowKey={row => row.id}
            scroll={{ x: 'max-content' }}
            pagination={false}
            rowSelection={{
              selectedRowKeys,
              onChange: (rowKey: string[]) => setSelectedRowKeys(rowKey),
            }}
          />
        ) : <Empty description={I18n.t('shared.no_data_found')} />}
      />
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
    pageSize: settings.pagination.defaultPageSize,
  },
)
