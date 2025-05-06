import React, { useEffect } from 'react'
import {
  Table, Pagination, Space, Typography, Input, Button, MenuProps,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import { MenuItem } from '~/interfaces/Antd'
import { TableLayout } from '~/modules/admin/components/TableLayout'
import { useResources } from '~/hooks/useResources/useResources'
import {
  MettlScheduleRecords as MettlScheduleRecordsType, MettlScheduleRecord,
} from '~/modules/admin/modules/client/core/mettlScheduleRecords'
import settings from '~/modules/admin/modules/client/routes/Client/routes/Project/settings'
import routeUtils from '~/utils/route'
import { DirectionalNavigateBackIcon } from '~/glint'
import { RootState } from '~/modules/admin/core/rootReducers'
import { get as getCurrentUser } from '~/core/currentUser'
import { openModal } from '~/modules/admin/core/ui/modals'
import { AddEditMettlScheduleRecordModal } from './AddEditMettlScheduleRecordModal'
import Modals from '~/modules/admin/components/Modals'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { UpdateResource } from '~/hooks/useResources/interfaces'


const { I18n } = window

const { Column } = Table

const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
  }),
  {
    openModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

const MODALS = {
  AddEditMettlScheduleRecordModal,
}

export const MettlScheduleRecordsComponent: React.FC<Props> = ({ openModal }) => {
  const { projectId } = useParams<{ projectId: string }>()
  const {
    data, meta, fetch, isLoading, changePage, createResource, updateResource,
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
          title={I18n.t('administration.projects.mettl_schedule_records.assessment_name')}
          dataIndex="assessmentName"
          key="assessment.name"
          sortOrder={getSortOrder('assessment.name')}
          sorter
        />
        <Column
          title={I18n.t('administration.projects.mettl_schedule_records.created_at')}
          dataIndex="createdAt"
          key="createdAt"
          sortOrder={getSortOrder('createdAt')}
          sorter
        />
        <Column
          key="manage"
          title={I18n.t('administration.projects.webhook_settings.column_manage')}
          render={mettlScheduleRecord => (
            <ConditionalDropdown
              menu={
                getActionsMenuProps({
                  mettlScheduleRecord,
                  updateMettlScheduleRecord: updateResource,
                  openModal,
                })
              }
            />
          )}
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
      <Button
        icon={<PlusOutlined />}
        type="primary"
        disabled={tableLoading}
        onClick={() => {
          openModal(
            'AddEditMettlScheduleRecordModal',
            {
              addMettlScheduleRecord: createResource,
            },
          )
        }}
      >
        {I18n.t('administration.projects.mettl_schedule_records.add')}
      </Button>
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
      <Modals modals={MODALS} />
    </div>
  )
}

interface ActionMenuData {
  mettlScheduleRecord: MettlScheduleRecord,
  updateMettlScheduleRecord: UpdateResource<MettlScheduleRecord>
  openModal(name: string, data?: {
    mettlScheduleRecord: MettlScheduleRecord,
    projectId?: number,
    updateMettlScheduleRecord?: UpdateResource<MettlScheduleRecord>,
  })
}

const getActionsMenuProps = (
  {
    mettlScheduleRecord, openModal, updateMettlScheduleRecord,
  }:ActionMenuData,
):MenuProps => {
  const menuItems: MenuItem[] = [
    {
      key: 'edit',
      label: I18n.t('administration.projects.mettl_schedule_records.actions.edit'),
    },
  ]

  const handleMenuClick = ({ key }) => {
    if (key === 'edit') {
      openModal(
        'AddEditMettlScheduleRecordModal', {
          updateMettlScheduleRecord,
          mettlScheduleRecord,
        },
      )
    }
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}

export const MettlScheduleRecords = connecter(MettlScheduleRecordsComponent)
