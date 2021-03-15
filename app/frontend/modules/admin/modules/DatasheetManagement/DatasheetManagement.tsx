import React, {
  FC, useEffect, useMemo, useState,
} from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router-dom'
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
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'

import withEnhancedTable from 'modules/admin/hoc/withEnhancedTable'
import { toReadableString } from 'modules/admin/modules/DatasheetManagement/utils'

import {
  get,
  fetch,
  FETCH as FETCH_DATASHEET,
} from 'modules/admin/modules/DatasheetManagement/core/list'
import { get as getTotal } from 'modules/admin/modules/DatasheetManagement/core/total'
import { get as getParentResource } from 'modules/admin/modules/DatasheetManagement/core/parentResource'
import {
  get as getColumnDefinitions,
  setVisibleColumns,
  getVisibleColumnNames,
} from 'modules/admin/modules/DatasheetManagement/core/columnDefinitions'
import { isRequestInProgress } from 'modules/admin/core/request'

import { RootState } from 'modules/admin/core/rootReducers'
import { TableProps } from 'modules/admin/hoc/withEnhancedTable/interfaces'
import {
  DrawerModes,
  ParentResourceType,
} from 'modules/admin/modules/DatasheetManagement/interfaces'

import { COLUMN_ID_EMAIL } from 'modules/admin/modules/DatasheetManagement/constants'
import settings from 'modules/admin/settings'

import Modals from 'modules/admin/components/Modals/'

import { CountDisplay } from 'components/CountDisplay'
import { ColumnToggler } from 'modules/admin/modules/DatasheetManagement/components/ColumnToggler'
import { SelectionActions } from 'modules/admin/modules/DatasheetManagement/components/SelectionActions'
import ToolsDropdown from 'modules/admin/modules/DatasheetManagement/components/ToolsDropdown'
import { DetailsDrawer } from 'modules/admin/modules/DatasheetManagement/components/DetailsDrawer'
import { AddEditDrawer } from 'modules/admin/modules/DatasheetManagement/components/AddEditDrawer'
import ImportDatasheetModal from 'modules/admin/modules/DatasheetManagement/components/ImportDatasheetModal'

const { I18n } = window

const connector = connect(
  (state: RootState) => ({
    list: get(state),
    isListLoading: isRequestInProgress(state, FETCH_DATASHEET),
    total: getTotal(state),
    columnDefinitions: getColumnDefinitions(state),
    visibleColumns: getVisibleColumnNames(state),
    temp__parentResourceId: getParentResource(state).id, // wont be needing this when projects comes under router
  }),
  {
    fetch,
    setVisibleColumns,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>

interface OwnProps {
  parentResourceType: ParentResourceType
}

type Props = OwnProps & PropsFromRedux & TableProps

const MODALS = {
  ImportDatasheetModal,
}

const DatasheetManagementComponent: FC<Props> = ({
  list,
  isListLoading,
  total,
  temp__parentResourceId,
  columnDefinitions,
  parentResourceType,
  tableConfig: { filters, page },
  tableConfig,
  changeFilter,
  changePage,
  fetch,
  visibleColumns,
  setVisibleColumns,
}) => {
  const { campaignId, projectId } = useParams<{
    projectId?: string
    campaignId?: string
  }>()

  let parentResourceId: number | undefined = temp__parentResourceId
  if (!parentResourceId && parentResourceType === ParentResourceType.Project && projectId) {
    parentResourceId = parseInt(projectId, 10)
  } else if (!parentResourceId && parentResourceType === ParentResourceType.Campaign && campaignId) {
    parentResourceId = parseInt(campaignId, 10)
  }

  if (parentResourceId === undefined) { return null }

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])

  const [activeDrawerIs, setDrawerTo] = useState<DrawerModes>(DrawerModes.None)
  const [currentDatasheetId, setCurrentDatasheetId] = useState('')

  const allColumns = useMemo(
    () => columnDefinitions
      .map((filteredColumn) => {
        if (filteredColumn.id === COLUMN_ID_EMAIL) {
          return {
            title: 'Email',
            dataIndex: filteredColumn.id,
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
          title: toReadableString(filteredColumn.id),
          dataIndex: filteredColumn.id,
        }
      }),
    [columnDefinitions],
  )

  const visibleColumnsDefinition = useMemo(
    () => allColumns.filter(originalColumn => visibleColumns.includes(originalColumn.dataIndex)),
    [columnDefinitions, visibleColumns],
  )

  useEffect(() => {
    if (parentResourceId === undefined) { return }

    fetch(parentResourceType, parentResourceId, tableConfig)
  }, [tableConfig])

  const toggleDrawer = (mode: DrawerModes, id = '') => {
    setDrawerTo(mode)
    setCurrentDatasheetId(id)
  }

  const onVisibleColumnsChange = (changedVisibleColumnKey: string[]): void => {
    if (parentResourceId === undefined) { return }

    setVisibleColumns(parentResourceType, parentResourceId, changedVisibleColumnKey)
  }

  return (
    <>
      <Row justify="space-between" className="pt-4 pb-4 ps-4 pe-4">
        <Col>
          <CountDisplay
            selectedCount={selectedRowKeys.length}
            totalCount={total}
            isLoading={isListLoading}
          />
        </Col>
        <Col>
          <Space>
            <SelectionActions
              selectedRowKeys={selectedRowKeys}
              setSelectedRowKeys={setSelectedRowKeys}
              toggleDrawer={toggleDrawer}
              parentResourceType={parentResourceType}
              parentResourceId={parentResourceId}
            />
            <Divider type="vertical" />
            <Input.Search
              placeholder={I18n.t(
                'administration.datasheets.list.header.search_record',
              )}
              value={filters.emailCont}
              onChange={e => changeFilter('emailCont', e.target.value)}
            />
            <ColumnToggler
              visibleColumnsKeys={visibleColumns}
              onVisibleColumnsChange={onVisibleColumnsChange}
            />
            <ToolsDropdown parentId={parentResourceId} parentType={parentResourceType} />
            {isEmpty(columnDefinitions) || (
              <Button
                type="primary"
                onClick={() => toggleDrawer(DrawerModes.Add)}
                disabled={isListLoading}
              >
                <PlusOutlined />
                {I18n.t('administration.datasheets.list.header.add_record')}
              </Button>
            )}
          </Space>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
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
      <DetailsDrawer
        isOpen={activeDrawerIs === DrawerModes.Details}
        toggleDrawer={toggleDrawer}
        currentDatasheetId={currentDatasheetId}
        parentResourceType={parentResourceType}
        parentResourceId={parentResourceId}
      />
      <AddEditDrawer
        isOpen={
          activeDrawerIs === DrawerModes.Edit
          || activeDrawerIs === DrawerModes.Add
        }
        toggleDrawer={toggleDrawer}
        currentDatasheetId={currentDatasheetId}
        mode={activeDrawerIs}
        parentResourceType={parentResourceType}
        parentResourceId={parentResourceId}
      />
      <Modals modals={MODALS} />
    </>
  )
}

export const DatasheetManagement = withEnhancedTable<OwnProps>(
  connector(DatasheetManagementComponent),
  'datasheet',
  {
    maintainHistory: true,
  },
)
