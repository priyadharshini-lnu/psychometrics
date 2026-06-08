import React, { useState, useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Table, Row, Col, Pagination, Input, Space, Button, DatePicker, Form, Select, Spin,
} from 'antd'
import { Link } from 'react-router-dom'
import { AppstoreOutlined, SearchOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { RangeValueType } from '~/interfaces/Antd'
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
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'

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

export type PropsFromRedux = ConnectedProps<typeof connecter>;
type Props = TableProps & PropsFromRedux;

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
    onTableChange,
    changeFilter,
    removeFilter,
    removeAllFilters,
    changePage,
  },
) => {
  useEffect(() => {
    const today = dayjs()
    const filtersForCurrentDayPresent = tableConfig.filters.created_at_gteq && tableConfig.filters.created_at_lteq

    if (!filtersForCurrentDayPresent || tableConfig.initialized === false) {
      const updatedFilters = {
        ...tableConfig.filters,
        created_at_gteq: today.startOf('day').toString(),
        created_at_lteq: today.endOf('day').toString(),
      }

      fetch({
        ...tableConfig,
        filters: updatedFilters,
      })
    } else {
      fetch(tableConfig)
    }
  }, [tableConfig])

  const today = dayjs()
  const initialRange: [dayjs.Dayjs, dayjs.Dayjs] = [today.startOf('day'), today.endOf('day')]

  const [range, setRange] = useState<RangeValueType | null>(initialRange)

  const [form] = Form.useForm()
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSearch = (values) => {
    const {
      recordId, recordType, action, dateRange, user, client, project, campaign,
    } = values
    changeFilter('record_id_eq', recordId)
    changeFilter('record_type_in', recordType)
    changeFilter('action_in', action)

    if (dateRange) {
      changeFilter('created_at_gteq', dateRange[0].startOf('day').toString())
      changeFilter('created_at_lteq', dateRange[1].endOf('day').toString())
    } else {
      removeFilter('created_at_gteq')
      removeFilter('created_at_lteq')
    }

    changeFilter('user_search', user)
    changeFilter('client_search', client)
    changeFilter('project_search', project)
    changeFilter('campaign_search', campaign)
  }

  const handleReset = () => {
    form.resetFields()
    removeAllFilters('auditLogList')
    setRange(initialRange)
  }

  const disabledDate = (current) => {
    if (!range || !range[0]) {
      return current && current > dayjs().endOf('day')
    }
    const tooLate = range[0] && current.diff(range[0], 'days') > 30

    return tooLate || current > dayjs().endOf('day')
  }

  const onCalendarChange = (dates) => {
    setRange(dates)
  }

  return isLoading ? <PageContentSkeleton /> : (
    <div style={{ marginTop: '10px' }}>
      <Breadcrumb
        crumbs={[
          {
            link: () => '/admin',
            label: () => I18n.t('admin.dashboard'),
          },
          {
            link: () => '/admin/audit_logs',
            label: () => I18n.t('admin.audit_logs'),
          },
        ]}
      />

      <div style={{ marginTop: '30px' }}>
        <Form form={form} layout="vertical" onFinish={handleSearch} className="ms-5 me-5">
          <Row gutter={[16, 16]} justify="start">
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="recordId" label={I18n.t('admin.record_id')}>
                <Input placeholder={I18n.t('admin.search_record')} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="recordType" label={I18n.t('admin.audit_log_type')}>
                <Select
                  placeholder={I18n.t('admin.audit_log_type')}
                  showSearch
                  allowClear
                >
                  {types.map(type => (
                    <Select.Option key={type} value={type}>{type}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item
                name="dateRange"
                label={I18n.t('admin.date_range')}
                initialValue={initialRange}
              >
                <DatePicker.RangePicker
                  onCalendarChange={onCalendarChange}
                  disabledDate={disabledDate}
                  allowClear={false}
                  ranges={{
                    [I18n.t('admin.date_presets_today')]: [
                      dayjs().startOf('day'),
                      dayjs().endOf('day'),
                    ],
                    [I18n.t('admin.date_presets_yesterday')]: [
                      dayjs().subtract(1, 'day').startOf('day'),
                      dayjs().subtract(1, 'day').endOf('day'),
                    ],
                    [I18n.t('admin.date_presets_last_week')]: [
                      dayjs().subtract(1, 'week').startOf('week'),
                      dayjs().subtract(1, 'week').endOf('week'),
                    ],
                    [I18n.t('admin.date_presets_last_month')]: [
                      dayjs().subtract(1, 'month').startOf('month'),
                      dayjs().subtract(1, 'month').endOf('month'),
                    ],
                    [I18n.t('admin.date_presets_last_7_days')]: [
                      dayjs().subtract(7, 'd'),
                      dayjs(),
                    ],
                    [I18n.t('admin.date_presets_last_30_days')]: [
                      dayjs().subtract(30, 'd'),
                      dayjs(),
                    ],
                  }}
                />
              </Form.Item>
            </Col>
            {isExpanded && (
              <>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item name="action" label={I18n.t('shared.action')}>
                    <Select
                      placeholder={I18n.t('shared.action')}
                      showSearch
                      allowClear
                    >
                      {(actions || []).map(action => (
                        <Select.Option key={action} value={action}>{action}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item name="user" label={I18n.t('admin.search_user')}>
                    <Input placeholder={I18n.t('admin.search_user')} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item name="client" label={I18n.t('admin.search_client')}>
                    <Input placeholder={I18n.t('admin.search_client')} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item name="project" label={I18n.t('admin.search_project')}>
                    <Input placeholder={I18n.t('admin.search_project')} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item name="campaign" label={I18n.t('admin.search_campaign')}>
                    <Input placeholder={I18n.t('admin.search_campaign')} />
                  </Form.Item>
                </Col>
              </>
            )}
            <Col span={24} style={{ textAlign: 'right' }}>
              <Form.Item>
                <Space>
                  <Button onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded
                      ? I18n.t('admin.collapse_filters')
                      : I18n.t('admin.expand_filters')
                    }
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SearchOutlined />}
                  >
                    {I18n.t('shared.search')}
                  </Button>
                  <Button onClick={handleReset}>{I18n.t('shared.reset')}</Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>

      <Row justify="space-between" className="pm">
        <Col span={4} className="pls">
          <AppstoreOutlined style={{ fontSize: '16px' }} />
          <span className="mlm">{`${total} ${I18n.t('admin.audit_logs')}`}</span>
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
              title={I18n.t('admin.record_id')}
              key="recordId"
              dataIndex="recordId"
            />
            <Column
              title={I18n.t('admin.audit_log_type')}
              key="recordType"
              dataIndex="recordType"
            />
            <Column
              title={I18n.t('shared.action')}
              key="action"
              render={({ id, action }) => (
                <Link to={`${settings.urlPrefix}/${id}`}>{action}</Link>
              )}
            />
            <Column
              title={I18n.t('admin.log_date')}
              dataIndex="createdAt"
              key="createdAt"
              render={createdAt => (
                dayjs(createdAt).format('lll')
              )}
            />
            <Column
              title={I18n.t('admin.user')}
              key="user"
              render={({ user, userId }) => {
                if (!userId) return null

                return user ? user.email : `${userId} - deleted`
              }}
            />
            <Column
              title={I18n.t('admin.client')}
              key="client"
              render={({ client, clientId }) => (
                client
                  ? <a href={`/admin/clients/${client.id}/projects`}>{client.name}</a>
                  : clientId && `${clientId} - deleted`
              )}
            />
            <Column
              title={I18n.t('admin.project')}
              key="project"
              render={({ project, projectId }) => (
                project
                  ? <a href={`/admin/projects/${project.id}/new_campaigns`}>{project.name}</a>
                  : projectId && `${projectId} - deleted`
              )}
            />
            <Column
              title={I18n.t('admin.campaign')}
              key="campaign"
              render={({
                project, campaignId, campaign,
              }) => (

                campaign ? (
                  <a href={`/admin/projects/${project.id}/new_campaigns/${campaign.id}`}>
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
    </div>
  )
}

export default withEnhancedTable<{}>(connecter(AuditLogList), 'auditLogList', {
  maintainHistory: true,
  filterPredicates: FILTER_PREDICATES,
})
