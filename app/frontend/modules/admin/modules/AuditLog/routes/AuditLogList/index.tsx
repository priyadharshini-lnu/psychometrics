
import React, { useState, useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Table, Row, Col, Pagination, Input, Space, Button, DatePicker, Spin,
} from 'antd'
import { AppstoreOutlined, SearchOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { RangeValue } from 'rc-picker/lib/interface'
import dayjs from '~/utils/dayjs'
import {
  get as getLogs, fetch, fetchActions, FETCH,
} from '~/modules/admin/modules/AuditLog/core'
import { DEFAULT_PAGE_SIZE } from '~/constants/campaign'
import { RootState } from '~/modules/admin/core/rootReducers'
import withEnhancedTable from '~/modules/admin/hoc/withEnhancedTable'
import { TableProps } from '~/modules/admin/hoc/withEnhancedTable/interfaces'
import { PageContentSkeleton } from '~/modules/endUser/modules/campaigns/components/PageContentSkeleton'
import { isRequestInProgress } from '~/core/request'
import settings from '../../settings'

export const FILTER_PREDICATES = {
  recordType: 'In',
  action: 'In',
}

const connecter = connect(
  (state: RootState) => ({
    auditLogs: getLogs(state),
    isLoading: isRequestInProgress(state, FETCH),
  }),
  {
    fetch,
    fetchActions,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = TableProps & PropsFromRedux

const { Column } = Table
const { I18n } = window

const AuditLogList: React.FC<Props> = (
  {
    auditLogs: {
      list, total, types, actions,
    },
    fetch,
    tableConfig: {
      page, pageSize,
    },
    isLoading,
    tableConfig,
    getFilteredValue,
    onTableChange,
    changeFilter,
    removeFilter,
    changePage,
  },
) => {
  useEffect(() => {
    fetch(tableConfig)
  }, [tableConfig])

  let initialRange: [dayjs.Dayjs, dayjs.Dayjs] | null = null
  if (tableConfig.filters.created_at_gteq && tableConfig.filters.created_at_lteq) {
    initialRange = [dayjs(tableConfig.filters.created_at_gteq), dayjs(tableConfig.filters.created_at_lteq)]
  }
  const [range, setRange] = useState<RangeValue<dayjs.Dayjs> | null | undefined>(initialRange || null)


  const filterProps = (type: string, value = '', filter = '') => ({
    filterDropdown: ({
      selectedKeys, confirm, setSelectedKeys,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={I18n.t(`administration.audit_log.search_${type}`)}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          defaultValue={value}
          value={selectedKeys[0]}
          onPressEnter={() => changeFilter(filter || `${type}_search`, selectedKeys[0])}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
            onClick={() => {
              confirm({ closeDropdown: false })
              changeFilter(filter || `${type}_search`, selectedKeys[0])
            }}
          >
            {I18n.t('administration.audit_log.search')}
          </Button>
          <Button
            onClick={() => {
              removeFilter(filter || `${type}_search`)
              setSelectedKeys([])
            }}
            size="small"
            style={{ width: 90 }}
          >
            {I18n.t('administration.audit_log.reset')}
          </Button>
        </Space>
      </div>
    ),
    filterIcon: () => <SearchOutlined style={{ color: value ? '#1BAF99' : undefined }} />,
  })

  return isLoading ? <PageContentSkeleton /> : (
    <>
      <Row justify="space-between" className="pm">
        <Col span={4} className="pls">
          <AppstoreOutlined style={{ fontSize: '16px' }} />
          <span className="mlm">{`${total} Audit Logs`}</span>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Table
            className="mtm"
            rowKey="id"
            dataSource={list}
            onChange={onTableChange}
            pagination={false}
            loading={{
              spinning: isLoading,
              indicator: <Spin size="large" />,
            }}
            scroll={{ x: 'auto' }}
          >
            <Column
              title={I18n.t('administration.audit_log.record_id')}
              key="recordId"
              dataIndex="recordId"
              {...filterProps('record', tableConfig.filters.record_id_eq, 'record_id_eq')}
            />
            <Column
              title={I18n.t('administration.audit_log.type')}
              key="recordType"
              dataIndex="recordType"
              filters={types.map((t: string) => ({ text: t, value: t }))}
              filteredValue={getFilteredValue('recordType')}
            />
            <Column
              title={I18n.t('administration.audit_log.action')}
              key="action"
              filters={actions && actions.map((t: string) => ({ text: t, value: t }))}
              filteredValue={getFilteredValue('action')}
              render={({ id, action }) => (
                <Link to={`${settings.urlPrefix}/${id}`}>{action}</Link>
              )}
            />
            <Column
              title={I18n.t('administration.audit_log.log_date')}
              dataIndex="createdAt"
              key="createdAt"
              render={createdAt => (
                dayjs(createdAt).format('lll')
              )}
              filterDropdown={({
                confirm,
              }) => (
                <div style={{ padding: 8 }}>
                  <DatePicker.RangePicker
                    value={range}
                    onChange={dates => setRange(dates)}
                  />
                  <div className="mtm flex justify-content-space-between">
                    <Button
                      type="primary"
                      icon={<SearchOutlined />}
                      size="small"
                      style={{ width: 90 }}
                      onClick={() => {
                        confirm({ closeDropdown: true })
                        if (range) {
                          range[0] && changeFilter('created_at_gteq', range[0].startOf('day').toString())
                          range[1] && changeFilter('created_at_lteq', range[1].endOf('day').toString())
                        }
                      }}
                    >
                      {I18n.t('administration.audit_log.search')}
                    </Button>
                    <Button
                      onClick={() => {
                        setRange(null)
                        removeFilter('created_at_gteq')
                        removeFilter('created_at_lteq')
                        confirm({ closeDropdown: true })
                      }}
                      size="small"
                      style={{ width: 90 }}
                    >
                      {I18n.t('administration.audit_log.reset')}
                    </Button>
                  </div>
                </div>
              )}
              filterIcon={() => <SearchOutlined style={{ color: range ? '#1BAF99' : undefined }} />}
            />
            <Column
              title={I18n.t('administration.audit_log.user')}
              key="user"
              {...filterProps('user', tableConfig.filters.user_search)}
              render={({ user, userId }) => {
                if (!userId) return null

                return user ? user.email : `${userId} - deleted`
              }}
            />
            <Column
              title={I18n.t('administration.audit_log.client')}
              key="client"
              {...filterProps('client', tableConfig.filters.client_search)}
              render={({ client, clientId }) => (
                client
                  ? <a href={`/admin/clients/${client.id}/projects`}>{client.name}</a>
                  : clientId && `${clientId} - deleted`
              )}
            />
            <Column
              title={I18n.t('administration.audit_log.project')}
              key="project"
              {...filterProps('project', tableConfig.filters.project_search)}
              render={({ project, projectId }) => (
                project
                  ? <a href={`/admin/projects/${project.id}/new_campaigns`}>{project.name}</a>
                  : projectId && `${projectId} - deleted`
              )}
            />
            <Column
              title={I18n.t('administration.audit_log.campaign')}
              key="campaign"
              {...filterProps('campaign', tableConfig.filters.campaign_search)}
              render={({ projectId, campaignId, campaign }) => (
                campaign ? (
                  <a href={`/admin/projects/${projectId}/new_campaigns/${campaignId}`}>
                    {campaign.name}
                  </a>
                ) : campaignId && `${campaignId} - deleted`
              )}
            />
          </Table>
        </Col>
      </Row>
      <div className="pl">
        <Pagination
          current={page}
          pageSize={pageSize || DEFAULT_PAGE_SIZE}
          total={total}
          onChange={changePage}
          hideOnSinglePage
        />
      </div>
    </>
  )
}

export default withEnhancedTable<{}>(connecter(AuditLogList), 'auidtLogList', {
  maintainHistory: true,
  filterPredicates: FILTER_PREDICATES,
})
