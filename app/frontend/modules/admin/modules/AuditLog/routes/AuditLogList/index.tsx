import React, { useState, useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Table, Row, Col, Pagination, Input, Space, Button, DatePicker, Form, Select, Spin,
} from '@thetalententerprise/glint'
import { App } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import qs from 'qs'
import { AppstoreOutlined, SearchOutlined, DownloadOutlined } from '@thetalententerprise/glint/icons'
import { RangeValueType } from '~/interfaces/Antd'
import dayjs from '~/utils/dayjs'
import {
  get as getLogs, fetch, fetchActions, scheduleExport, FETCH,
} from '~/modules/admin/modules/AuditLog/core'
import { DEFAULT_PAGE_SIZE } from '~/constants/campaign'
import { RootState } from '~/modules/admin/core/rootReducers'
import withEnhancedTable from '~/modules/admin/hoc/withEnhancedTable'
import { TableProps } from '~/modules/admin/hoc/withEnhancedTable/interfaces'
import { PageContentSkeleton } from '~/modules/endUser/modules/campaigns/components/PageContentSkeleton'
import { isRequestInProgress } from '~/core/request'
import { get as getCurrentUser, isSuperAdmin } from '~/core/currentUser'
import settings from '../../settings'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import AuditLogTabs from '../../components/Tabs'

export const FILTER_PREDICATES = {
  recordType: 'In',
  action: 'In',
}

const connecter = connect(
  (state: RootState) => ({
    auditLogs: getLogs(state),
    isLoading: isRequestInProgress(state, FETCH),
    currentUser: getCurrentUser(state),
  }),
  {
    fetch,
    fetchActions,
    scheduleExport,
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
    currentUser,
    scheduleExport,
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

  const navigate = useNavigate()
  const auditLogPath = settings.urlPrefix.startsWith('/')
    ? settings.urlPrefix
    : `/${settings.urlPrefix}`

  const today = dayjs()
  const initialRange: [dayjs.Dayjs, dayjs.Dayjs] = [today.startOf('day'), today.endOf('day')]

  const [range, setRange] = useState<RangeValueType | null>(initialRange)

  const [form] = Form.useForm()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isExportLoading, setIsExportLoading] = useState(false)
  const { message: messageApi } = App.useApp()

  useEffect(() => {
    const { filters } = tableConfig
    const hasExpandedFilters = filters.user_search || filters.client_search
      || filters.project_search || filters.campaign_search || filters.action_in

    if (hasExpandedFilters) setIsExpanded(true)

    const dateRange = filters.created_at_gteq && filters.created_at_lteq
      ? [dayjs(filters.created_at_gteq), dayjs(filters.created_at_lteq)]
      : initialRange

    form.setFieldsValue({
      recordId: filters.record_id_eq || undefined,
      recordType: filters.record_type_in || undefined,
      action: filters.action_in || undefined,
      dateRange,
      user: filters.user_search || undefined,
      client: filters.client_search || undefined,
      project: filters.project_search || undefined,
      campaign: filters.campaign_search || undefined,
    })
  }, [])

  const handleSearch = (values) => {
    const {
      recordId, recordType, action, dateRange, user, client, project, campaign,
    } = values

    const filters: Record<string, string | undefined> = {
      record_id_eq: recordId,
      record_type_in: recordType,
      action_in: action,
      created_at_gteq: dateRange?.[0].startOf('day').toString(),
      created_at_lteq: dateRange?.[1].endOf('day').toString(),
      user_search: user,
      client_search: client,
      project_search: project,
      campaign_search: campaign,
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) changeFilter(key, value)
      else removeFilter(key)
    })

    const activeFilters = Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
    const queryString = qs.stringify({ filters: activeFilters })
    navigate({
      pathname: auditLogPath,
      search: queryString ? `?${queryString}` : '',
    }, { replace: true })
  }

  const handleReset = () => {
    form.resetFields()
    removeAllFilters('auditLogList')
    setRange(initialRange)
    navigate(auditLogPath, { replace: true })
  }

  const handleExportCsv = () => {
    setIsExportLoading(true)

    const filtersForCurrentDayPresent = tableConfig.filters.created_at_gteq && tableConfig.filters.created_at_lteq
    const exportFilters = filtersForCurrentDayPresent
      ? tableConfig.filters
      : {
        ...tableConfig.filters,
        created_at_gteq: dayjs().startOf('day').toString(),
        created_at_lteq: dayjs().endOf('day').toString(),
      }

    scheduleExport(exportFilters)
      .then(() => messageApi.success(I18n.t('admin.audit_logs_export_queued')))
      .catch(() => messageApi.error(I18n.t('admin.audit_logs_export_failed')))
      .finally(() => setIsExportLoading(false))
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

      <AuditLogTabs />

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
                  options={types.map(type => ({ label: type, value: type }))}
                />
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
                  presets={[
                    {
                      label: I18n.t('admin.date_presets_today'),
                      value: [
                        dayjs().startOf('day'),
                        dayjs().endOf('day'),
                      ],
                    },
                    {
                      label: I18n.t('admin.date_presets_yesterday'),
                      value: [
                        dayjs().subtract(1, 'day').startOf('day'),
                        dayjs().subtract(1, 'day').endOf('day'),
                      ],
                    },
                    {
                      label: I18n.t('admin.date_presets_last_week'),
                      value: [
                        dayjs().subtract(1, 'week').startOf('week'),
                        dayjs().subtract(1, 'week').endOf('week'),
                      ],
                    },
                    {
                      label: I18n.t('admin.date_presets_last_month'),
                      value: [
                        dayjs().subtract(1, 'month').startOf('month'),
                        dayjs().subtract(1, 'month').endOf('month'),
                      ],
                    },
                    {
                      label: I18n.t('admin.date_presets_last_7_days'),
                      value: [
                        dayjs().subtract(7, 'd'),
                        dayjs(),
                      ],
                    },
                    {
                      label: I18n.t('admin.date_presets_last_30_days'),
                      value: [
                        dayjs().subtract(30, 'd'),
                        dayjs(),
                      ],
                    },
                  ]}
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
                      options={(actions || []).map(action => ({ label: action, value: action }))}
                    />
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
                  {isSuperAdmin(currentUser) && (
                    <Button
                      loading={isExportLoading}
                      onClick={handleExportCsv}
                      disabled={total === 0}
                      icon={<DownloadOutlined />}
                    >
                      {I18n.t('admin.export_to_csv')}
                    </Button>
                  )}
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
