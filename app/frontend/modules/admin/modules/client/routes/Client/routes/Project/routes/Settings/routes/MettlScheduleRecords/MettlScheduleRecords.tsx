import React, { useEffect } from 'react'
import {
  Table, Pagination, Space, Typography,
  Input,
} from 'antd'

import { useNavigate, useParams } from 'react-router-dom'
import { TableLayout } from '~/modules/admin/components/TableLayout'
import { useResources } from '~/hooks/useResources/useResources'
import {
  MettlScheduleRecords as MettlScheduleRecordsType,
} from '~/modules/admin/modules/client/core/mettlScheduleRecords'
import settings from '~/modules/admin/modules/client/routes/Client/routes/Project/settings'
import routeUtils from '~/utils/route'
import { DirectionalNavigateBackIcon } from '~/glint'

const { I18n } = window

const { Column } = Table

export const MettlScheduleRecords: React.FC<{}> = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const {
    data, meta, fetch, isLoading, changePage,
    currentPage, pageSize, getSortOrder, handleTableChange, requests, getFilteredValue, changeFilter,
  } = useResources<MettlScheduleRecordsType>(
    'mettl_schedule_records',
    {
      basePath: `projects/${projectId}`,
      trackUrl: true,
    },
  )

  const tableLoading = isLoading('fetch')

  const navigate = useNavigate()
  const prefix = `${settings.urlPrefix}/:projectId/settings`

  const handleTabChange = (currentTab) => {
    routeUtils.moveTo(navigate, prefix, `/${currentTab}`)
  }

  useEffect(() => {
    fetch()
  }, [])

  const MettlScheduleRecordsTable = (
    <>
      <Table
        dataSource={data}
        loading={tableLoading}
        onChange={handleTableChange}
        pagination={false}
      >
        <Column
          title={I18n.t('common.column.id')}
          dataIndex="id"
          key="id"
          sortOrder={getSortOrder('id')}
          sorter
        />
        <Column
          title={I18n.t('administration.projects.mettl_schedule_records.schedule_id')}
          dataIndex="scheduleId"
          key="scheduleId"
          sortOrder={getSortOrder('scheduleId')}
          sorter
        />
        <Column
          title={I18n.t('administration.projects.mettl_schedule_records.schedule_name')}
          dataIndex="scheduleName"
          key="scheduleName"
          sortOrder={getSortOrder('scheduleName')}
          sorter
        />
        <Column
          title={I18n.t('administration.projects.mettl_schedule_records.created_at')}
          dataIndex="createdAt"
          key="createdAt"
          sortOrder={getSortOrder('createdAt')}
          sorter
        />
      </Table>
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={meta.recordCount}
        onChange={changePage}
        className="pl"
      />
    </>
  )

  const Filter = (
    <Space>
      <Input.Search
        placeholder={I18n.t('administration.projects.mettl_schedule_records.search')}
        value={getFilteredValue('filterable_fields')}
        onChange={e => changeFilter('filterable_fields', e.target.value)}
      />
    </Space>
  )


  return (
    <div style={{ padding: 20 }}>
      <Space>
        <DirectionalNavigateBackIcon onClick={() => handleTabChange('integrations')} />
        <Typography.Title level={5}>
          {I18n.t('administration.integrations.actions.back')}
        </Typography.Title>
      </Space>

      <TableLayout
        table={MettlScheduleRecordsTable}
        filters={Filter}
        recordCount={meta.recordCount}
        requestStatus={requests.fetch?.status}
        loading={tableLoading}
      />
    </div>
  )
}
