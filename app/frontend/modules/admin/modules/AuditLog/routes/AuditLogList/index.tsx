import React, {
  useEffect, useLayoutEffect, useRef, useState,
} from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Table, Button, Flex, Input,
  DataTableDisplayDrawer, DataTableDisplaySider, DataTableDisplaySiderButton,
  DATA_TABLE_DISPLAY_TABS, useBreakpoint, useGlintToken, visibleColumns,
} from '@thetalententerprise/glint'
import type {
  ColumnsType, DataTableColumnNode, DataTableFilter, DataTableFilterOption, InputRef, RangePickerProps,
} from '@thetalententerprise/glint'
import { App } from 'antd'
import type { FilterDropdownProps } from 'antd/es/table/interface'
import { Link, useNavigate } from 'react-router-dom'
import qs from 'qs'
import { DownloadOutlined, FilterAlt, Search } from '@thetalententerprise/glint/icons'
import dayjs from '~/utils/dayjs'
import {
  get as getLogs, fetch, fetchActions, scheduleExport, FETCH, Log,
} from '~/modules/admin/modules/AuditLog/core'
import { DEFAULT_PAGE_SIZE } from '~/constants/campaign'
import { RootState } from '~/modules/admin/core/rootReducers'
import withEnhancedTable from '~/modules/admin/hoc/withEnhancedTable'
import { TableProps } from '~/modules/admin/hoc/withEnhancedTable/interfaces'
import { TableConfig } from '~/modules/admin/core/filterAndPagination/interfaces'
import { isRequestInProgress } from '~/core/request'
import { get as getCurrentUser, isSuperAdmin } from '~/core/currentUser'
import { TableLayout } from '~/modules/admin/components/TableLayout'
import { useTableSettings } from '~/components/AdminShell/useTableSettings'
import settings from '../../settings'
import AuditLogTabs from '../../components/Tabs'

export const FILTER_PREDICATES = {
  recordType: 'In',
  action: 'In',
}

const AUDIT_LOG_CONFIG_KEY = 'audit_log_list'

// One panel control over two ransack keys; the pair is the stored shape, the single key is only the control's name.
const DATE_FILTER = 'created_at'
const DATE_FROM = 'created_at_gteq'
const DATE_TO = 'created_at_lteq'
const DATE_FORMAT = 'YYYY-MM-DD'
const MAX_SPAN_DAYS = 30

const PINNED_COLUMN = 'action'

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

const { I18n } = window

const heldValues = (value: string | string[] | undefined): string[] => {
  if (value == null) return []

  return Array.isArray(value) ? value : [value]
}

const asOptions = (values: (string | null)[] | undefined): DataTableFilterOption[] => (
  (values ?? []).flatMap(value => (value == null ? [] : [{ value, label: value }]))
)

const heldSpan = (filters: TableConfig['filters']): string[] => {
  const from = filters[DATE_FROM]
  const to = filters[DATE_TO]
  if (typeof from !== 'string' || typeof to !== 'string') return []

  return [dayjs(from).format(DATE_FORMAT), dayjs(to).format(DATE_FORMAT)]
}

const spanIsDefault = (filters: TableConfig['filters']): boolean => {
  const today = dayjs().format(DATE_FORMAT)

  return heldSpan(filters).every(value => value === today)
}

const spanFilters = (values: string[]): Record<string, string | undefined> => {
  const [from, to] = values
  if (from == null || to == null) return { [DATE_FROM]: undefined, [DATE_TO]: undefined }

  return {
    [DATE_FROM]: dayjs(from, DATE_FORMAT).startOf('day').toString(),
    [DATE_TO]: dayjs(to, DATE_FORMAT).endOf('day').toString(),
  }
}

const spanPresets = (): RangePickerProps['presets'] => [
  {
    label: I18n.t('admin.date_presets_today'),
    value: [dayjs().startOf('day'), dayjs().endOf('day')],
  },
  {
    label: I18n.t('admin.date_presets_yesterday'),
    value: [dayjs().subtract(1, 'day').startOf('day'), dayjs().subtract(1, 'day').endOf('day')],
  },
  {
    label: I18n.t('admin.date_presets_last_week'),
    value: [dayjs().subtract(1, 'week').startOf('week'), dayjs().subtract(1, 'week').endOf('week')],
  },
  {
    label: I18n.t('admin.date_presets_last_month'),
    value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')],
  },
  {
    label: I18n.t('admin.date_presets_last_7_days'),
    value: [dayjs().subtract(7, 'day').startOf('day'), dayjs().endOf('day')],
  },
  {
    label: I18n.t('admin.date_presets_last_30_days'),
    value: [dayjs().subtract(MAX_SPAN_DAYS, 'day').startOf('day'), dayjs().endOf('day')],
  },
]

const disabledDate: RangePickerProps['disabledDate'] = (current, { from }) => {
  if (current.isAfter(dayjs().endOf('day'))) return true

  return from != null && Math.abs(current.diff(from, 'days')) > MAX_SPAN_DAYS
}

type ColumnSearchProps = {
  applied: string
  placeholder: string
  visible: boolean
  onApply: (value: string) => void
}

// antd only remembers a selection its own confirm() committed, so the box reads the applied filter back on each open.
const ColumnSearch: React.FC<ColumnSearchProps> = ({
  applied, placeholder, visible, onApply,
}) => {
  const token = useGlintToken()
  const box = useRef<InputRef>(null)
  const [typed, setTyped] = useState(applied)

  useEffect(() => {
    if (!visible) return

    setTyped(applied)
    box.current?.focus()
  }, [visible, applied])

  return (
    <Flex vertical gap="small" style={{ padding: token.paddingXS }}>
      <Input
        ref={box}
        value={typed}
        placeholder={placeholder}
        prefix={<Search />}
        onChange={event => setTyped(event.target.value)}
        onPressEnter={() => onApply(typed.trim())}
      />
      <Flex justify="space-between" gap="small">
        <Button
          type="link"
          size="small"
          disabled={typed === '' && applied === ''}
          onClick={() => onApply('')}
        >
          {I18n.t('common.actions.reset')}
        </Button>
        <Button type="primary" size="small" onClick={() => onApply(typed.trim())}>
          {I18n.t('common.actions.search')}
        </Button>
      </Flex>
    </Flex>
  )
}

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
    changeFilters,
    changePage,
    currentUser,
    scheduleExport,
  },
) => {
  const navigate = useNavigate()
  const auditLogPath = settings.urlPrefix.startsWith('/')
    ? settings.urlPrefix
    : `/${settings.urlPrefix}`

  const { filters } = tableConfig
  const spanHeld = filters[DATE_FROM] != null && filters[DATE_TO] != null

  const [isExportLoading, setIsExportLoading] = useState(false)
  const { message: messageApi } = App.useApp()
  const screens = useBreakpoint()
  const narrow = screens.lg === false
  const { settings: tableSettings, save: saveSettings } = useTableSettings(AUDIT_LOG_CONFIG_KEY)
  const { hiddenColumns, panelOpen } = tableSettings

  const [openTab, setOpenTab] = useState<string | null>(
    (panelOpen ?? true) ? DATA_TABLE_DISPLAY_TABS.filters : null,
  )

  useEffect(() => {
    if (spanHeld) return

    const today = dayjs()
    changeFilters({
      ...filters,
      [DATE_FROM]: today.startOf('day').toString(),
      [DATE_TO]: today.endOf('day').toString(),
    })
  }, [tableConfig])

  useEffect(() => {
    if (!spanHeld) return

    fetch(tableConfig)
    const search = qs.stringify({ filters })
    navigate({ pathname: auditLogPath, search: search ? `?${search}` : '' }, { replace: true })
  }, [tableConfig])

  const handleExportCsv = () => {
    setIsExportLoading(true)

    scheduleExport(filters)
      .then(() => messageApi.success(I18n.t('admin.audit_logs_export_queued')))
      .catch(() => messageApi.error(I18n.t('admin.audit_logs_export_failed')))
      .finally(() => setIsExportLoading(false))
  }

  const handleFilterChange = (key: string, values: string[]) => {
    const next = key === DATE_FILTER
      ? { ...filters, ...spanFilters(values) }
      : { ...filters, [key]: values.length === 1 ? values[0] : values }

    changeFilters(next)
  }

  // `changeFilters` sets rather than merges, so naming only the default span is what drops the other seven.
  const handleReset = () => {
    const today = dayjs()

    changeFilters({ [DATE_FROM]: today.startOf('day').toString(), [DATE_TO]: today.endOf('day').toString() })
  }

  const searchColumn = (key: string, placeholder: string) => {
    const applied = heldValues(filters[key]).join('')

    return {
      filtered: applied !== '',
      filterDropdown: ({ close, visible }: FilterDropdownProps) => (
        <ColumnSearch
          applied={applied}
          placeholder={placeholder}
          visible={visible}
          onApply={(value) => {
            handleFilterChange(key, value === '' ? [] : [value])
            close()
          }}
        />
      ),
    }
  }

  const columns: ColumnsType<Log> = [
    {
      title: I18n.t('admin.record_id'),
      key: 'recordId',
      dataIndex: 'recordId',
      ...searchColumn('record_id_eq', I18n.t('admin.search_record')),
    },
    {
      title: I18n.t('admin.audit_log_type'),
      key: 'recordType',
      dataIndex: 'recordType',
    },
    {
      title: I18n.t('shared.action'),
      key: PINNED_COLUMN,
      dataIndex: 'action',
      render: (action, { id }) => <Link to={`${settings.urlPrefix}/${id}`}>{action}</Link>,
    },
    {
      title: I18n.t('admin.log_date'),
      key: 'createdAt',
      dataIndex: 'createdAt',
      render: createdAt => dayjs(createdAt).format('lll'),
    },
    {
      title: I18n.t('admin.user'),
      key: 'user',
      dataIndex: 'user',
      ...searchColumn('user_search', I18n.t('admin.search_user')),
      render: (user, { userId }) => {
        if (!userId) return null

        return user ? user.email : `${userId} - deleted`
      },
    },
    {
      title: I18n.t('admin.client'),
      key: 'client',
      dataIndex: 'client',
      ...searchColumn('client_search', I18n.t('admin.search_client')),
      render: client => (
        client && <Link to={`/admin/clients/${client.id}/projects`}>{client.name}</Link>
      ),
    },
    {
      title: I18n.t('admin.project'),
      key: 'project',
      dataIndex: 'project',
      ...searchColumn('project_search', I18n.t('admin.search_project')),
      render: project => (
        project && <Link to={`/admin/projects/${project.id}/new_campaigns`}>{project.name}</Link>
      ),
    },
    {
      title: I18n.t('admin.campaign'),
      key: 'campaign',
      dataIndex: 'campaign',
      ...searchColumn('campaign_search', I18n.t('admin.search_campaign')),
      render: (campaign, { project }) => (
        campaign && (
          <Link to={`/admin/projects/${project.id}/new_campaigns/${campaign.id}`}>
            {campaign.name}
          </Link>
        )
      ),
    },
  ]

  const columnNodes: DataTableColumnNode[] = columns.flatMap((column) => {
    const key = column.key == null ? null : String(column.key)
    if (key == null || key === PINNED_COLUMN || typeof column.title !== 'string') return []

    return [{ key, label: column.title }]
  })

  const panelFilters: DataTableFilter[] = [
    {
      key: 'record_id_eq',
      kind: 'text',
      label: I18n.t('admin.record_id'),
      placeholder: I18n.t('admin.search_record'),
      values: heldValues(filters.record_id_eq),
    },
    {
      key: 'record_type_in',
      label: I18n.t('admin.audit_log_type'),
      values: heldValues(filters.record_type_in),
      options: asOptions(types),
      control: 'select',
      placeholder: I18n.t('admin.audit_log_type'),
    },
    {
      key: DATE_FILTER,
      kind: 'dateRange',
      label: I18n.t('admin.date_range'),
      format: DATE_FORMAT,
      disabledDate,
      presets: spanPresets(),
      values: heldSpan(filters),
    },
    {
      key: 'action_in',
      label: I18n.t('shared.action'),
      values: heldValues(filters.action_in),
      options: asOptions(actions),
      control: 'select',
      placeholder: I18n.t('shared.action'),
    },
    {
      key: 'user_search',
      kind: 'text',
      label: I18n.t('admin.search_user'),
      placeholder: I18n.t('admin.search_user'),
      values: heldValues(filters.user_search),
    },
    {
      key: 'client_search',
      kind: 'text',
      label: I18n.t('admin.search_client'),
      placeholder: I18n.t('admin.search_client'),
      values: heldValues(filters.client_search),
    },
    {
      key: 'project_search',
      kind: 'text',
      label: I18n.t('admin.search_project'),
      placeholder: I18n.t('admin.search_project'),
      values: heldValues(filters.project_search),
    },
    {
      key: 'campaign_search',
      kind: 'text',
      label: I18n.t('admin.search_campaign'),
      placeholder: I18n.t('admin.search_campaign'),
      values: heldValues(filters.campaign_search),
    },
  ]

  const setPanel = (tab: string | null) => {
    setOpenTab(tab)
    if (!narrow) saveSettings({ panelOpen: tab !== null })
  }

  const togglePanel = (tab: string) => setPanel(openTab === tab ? null : tab)

  // The panel changes form across the breakpoint, and a drawer inheriting an open sider would cover the table.
  useLayoutEffect(() => { if (narrow) setOpenTab(null) }, [narrow])

  const panel = {
    label: I18n.t('admin.table_display_title'),
    closeLabel: I18n.t('shared.close'),
    columnsLabel: I18n.t('admin.table_display_columns'),
    activeTab: openTab ?? DATA_TABLE_DISPLAY_TABS.columns,
    onTabChange: setOpenTab,
    nodes: columnNodes,
    checkedKeys: columnNodes.map(({ key }) => key).filter(key => !hiddenColumns.includes(key)),
    onCheck: (checked: string[]) => saveSettings({
      hiddenColumns: columnNodes.map(({ key }) => key).filter(key => !checked.includes(key)),
      filters: tableSettings.filters,
    }),
    onClose: () => setPanel(null),
    filters: {
      label: I18n.t('admin.table_display_filters'),
      clearLabel: I18n.t('shared.clear_filters'),
      items: panelFilters,
      onChange: handleFilterChange,
    },
  }

  const chosen = panelFilters.some(({ key, values }) => (
    key === DATE_FILTER ? !spanIsDefault(filters) : values.length > 0
  ))

  const toolbar = (
    <Flex align="center" gap="small">
      <Button
        icon={<FilterAlt fill={chosen} />}
        aria-expanded={openTab === DATA_TABLE_DISPLAY_TABS.filters}
        onClick={() => togglePanel(DATA_TABLE_DISPLAY_TABS.filters)}
      >
        {I18n.t('admin.table_display_filters')}
      </Button>
      <Button disabled={!chosen} onClick={handleReset}>
        {I18n.t('common.actions.reset')}
      </Button>
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
    </Flex>
  )

  return (
    <>
      <AuditLogTabs />

      <TableLayout
        loading={isLoading}
        title={I18n.t('admin.audit_logs')}
        filters={toolbar}
        table={(
          <Table
            rowKey="id"
            dataSource={list}
            columns={visibleColumns(columns, hiddenColumns)}
            onChange={onTableChange}
            pagination={false}
            scroll={{ x: 'auto' }}
            sticky
          />
        )}
        pagination={{
          page,
          pageSize: pageSize || DEFAULT_PAGE_SIZE,
          total,
          onChange: changePage,
        }}
        recordCount={total}
        controls={(
          <DataTableDisplaySiderButton
            open={openTab === DATA_TABLE_DISPLAY_TABS.columns}
            filtered={columnNodes.some(({ key }) => hiddenColumns.includes(key))}
            onToggle={() => togglePanel(DATA_TABLE_DISPLAY_TABS.columns)}
            label={I18n.t('admin.table_display_columns')}
          />
        )}
        sider={narrow ? undefined : <DataTableDisplaySider {...panel} />}
        siderOpen={openTab !== null}
      />
      {narrow && <DataTableDisplayDrawer {...panel} open={openTab !== null} />}
    </>
  )
}

export default withEnhancedTable<{}>(connecter(AuditLogList), 'auditLogList', {
  maintainHistory: true,
  filterPredicates: FILTER_PREDICATES,
})
