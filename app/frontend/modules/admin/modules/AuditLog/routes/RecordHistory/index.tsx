import React, { useEffect, useState } from 'react'
import { connect, ConnectedProps, useDispatch } from 'react-redux'
import {
  Form, App,
} from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import qs from 'qs'
import dayjs from '~/utils/dayjs'
import { RootState } from '~/modules/admin/core/rootReducers'
import { RangeValueType } from '~/interfaces/Antd'
import useAsyncRequestResponse from '~/hooks/useAsyncRequestResponse'
import {
  fetchAuditableTypes,
  exportRecordHistory,
  fetchRevision,
  setRecordHistory,
  recordHistorySearchBody,
  getRecordHistory,
  getRecordHistoryTotal,
  getRecordHistoryTypes,
  getRecordHistoryFields,
  getRecordRevision,
  getAuditableTypes,
  RECORD_HISTORY_SEARCH_URL,
  RecordHistorySearchStatusTR,
  RecordHistorySearchStatus,
  AuditHistoryEntry,
  RecordHistoryResponse,
} from '~/modules/admin/modules/AuditLog/core'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import AuditLogTabs from '../../components/Tabs'
import SearchFilters from './components/SearchFilters'
import RecordHistoryResults from './components/RecordHistoryResults'
import RevisionPreviewModal from './components/RevisionPreviewModal'
import { SearchFormValues } from './types'
import {
  MAX_RANGE_DAYS,
  defaultDateRange,
  filterRecordType,
} from './helpers'

const connecter = connect(
  (state: RootState) => ({
    entries: getRecordHistory(state),
    total: getRecordHistoryTotal(state),
    resultTypes: getRecordHistoryTypes(state),
    resultFields: getRecordHistoryFields(state),
    revisionAttributes: getRecordRevision(state),
    auditableTypes: getAuditableTypes(state),
  }),
  {
    fetchAuditableTypes,
    exportRecordHistory,
    fetchRevision,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

const { I18n } = window
const RECORD_HISTORY_ROUTE_PATH = '/admin/audit_logs/record_trace'

const RecordHistory: React.FC<Props> = ({
  entries,
  total,
  resultTypes,
  resultFields,
  revisionAttributes,
  auditableTypes,
  fetchAuditableTypes,
  exportRecordHistory,
  fetchRevision,
}) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { search } = useLocation()
  const parsed = qs.parse(search, { ignoreQueryPrefix: true }) as Record<string, string>

  const { message: messageApi } = App.useApp()
  const [form] = Form.useForm()
  const [page, setPage] = useState(1)
  const [isExportLoading, setIsExportLoading] = useState(false)
  const [revisionVersion, setRevisionVersion] = useState<number | null>(null)
  const [isRevisionLoading, setIsRevisionLoading] = useState(false)
  const [range, setRange] = useState<RangeValueType | null>(defaultDateRange())

  const { asyncLoading: isLoading, makeAsyncRequest } = useAsyncRequestResponse<RecordHistorySearchStatus>({
    url: RECORD_HISTORY_SEARCH_URL,
    data: {},
    responseType: RecordHistorySearchStatusTR,
    pollingInterval: 2,
    numberOfTimesToPoll: 50,
  })

  const runSearch = (params: Parameters<typeof recordHistorySearchBody>[0]) => {
    makeAsyncRequest(recordHistorySearchBody(params))
      .then((result) => {
        const data = result?.responseData as RecordHistoryResponse | undefined

        if (typeof data === 'string') {
          messageApi.error(data)
          dispatch(setRecordHistory({
            list: [], total: 0, types: [], fields: [],
          }))
          return
        }

        if (data && typeof data === 'object' && 'error' in (data as Record<string, unknown>)) {
          messageApi.error(String((data as Record<string, unknown>).error || I18n.t('admin.record_history_no_results')))
          dispatch(setRecordHistory({
            list: [], total: 0, types: [], fields: [],
          }))
          return
        }

        if (data && typeof data === 'object' && Array.isArray(data.list)) {
          dispatch(setRecordHistory(data))
        }
      })
      .catch(() => messageApi.error(I18n.t('admin.record_history_no_results')))
  }

  const rootType = parsed.record_type
  const rootId = parsed.record_id
  const requestUuid = parsed.request_uuid
  const isRequestMode = Boolean(requestUuid)
  const hasQuery = Boolean((rootType && rootId) || requestUuid)

  useEffect(() => {
    fetchAuditableTypes()
  }, [])

  useEffect(() => {
    form.setFieldsValue({
      requestUuid: parsed.request_uuid || undefined,
      recordType: parsed.record_type || undefined,
      recordId: parsed.record_id || undefined,
      associatedRecord: parsed.associated_record === 'true',
      dateRange: parsed.start_date && parsed.end_date
        ? [dayjs(parsed.start_date), dayjs(parsed.end_date)]
        : defaultDateRange(),
    })

    if (requestUuid) {
      runSearch({
        requestUuid,
        page,
        auditableType: parsed.auditable_type,
        changedField: parsed.changed_field,
      })
    } else if (rootType && rootId) {
      runSearch({
        recordType: rootType,
        recordId: rootId,
        page,
        startDate: parsed.start_date,
        endDate: parsed.end_date,
        associatedRecord: parsed.associated_record === 'true',
        auditableType: parsed.auditable_type,
        changedField: parsed.changed_field,
      })
    }
  }, [search, page])

  const pushQuery = (nextParams: Record<string, string | undefined>) => {
    const active = Object.fromEntries(Object.entries(nextParams).filter(([, value]) => value))
    const queryString = qs.stringify(active)
    const currentQueryString = search.replace(/^\?/, '')
    const changed = queryString !== currentQueryString

    navigate(queryString ? `${RECORD_HISTORY_ROUTE_PATH}?${queryString}` : RECORD_HISTORY_ROUTE_PATH, { replace: true })

    return changed
  }

  const handleSearch = (values: SearchFormValues) => {
    const {
      requestUuid: requestUuidInput, recordType, recordId, associatedRecord, dateRange,
    } = values

    const normalizedRequestUuid = requestUuidInput?.trim()

    if (recordType && recordId) {
      form.setFieldValue('requestUuid', undefined)
      if (!dateRange || !dateRange[0] || !dateRange[1]) {
        form.setFields([{ name: 'dateRange', errors: [I18n.t('admin.record_history_date_range_required')] }])
        return
      }

      form.setFields([{ name: 'dateRange', errors: [] }])

      const [start, end] = dateRange
      const nextQuery = {
        request_uuid: undefined,
        record_type: recordType,
        record_id: recordId,
        auditable_type: undefined,
        changed_field: undefined,
        associated_record: associatedRecord ? 'true' : undefined,
        start_date: start.startOf('day').toISOString(),
        end_date: end.endOf('day').toISOString(),
      }

      setPage(1)
      const changed = pushQuery(nextQuery)
      if (!changed && page === 1) {
        runSearch({
          recordType,
          recordId,
          page: 1,
          startDate: nextQuery.start_date,
          endDate: nextQuery.end_date,
          associatedRecord: associatedRecord || false,
          auditableType: undefined,
          changedField: undefined,
        })
      }
      return
    }

    if (normalizedRequestUuid) {
      form.setFieldsValue({
        recordType: undefined,
        recordId: undefined,
        associatedRecord: false,
      })
      form.setFields([{ name: 'dateRange', errors: [] }])
      const nextQuery = {
        request_uuid: normalizedRequestUuid,
        auditable_type: undefined,
        changed_field: undefined,
        associated_record: undefined,
        start_date: undefined,
        end_date: undefined,
        record_type: undefined,
        record_id: undefined,
      }
      setPage(1)
      const changed = pushQuery(nextQuery)
      if (!changed && page === 1) {
        runSearch({
          requestUuid: normalizedRequestUuid,
          page: 1,
          auditableType: undefined,
          changedField: undefined,
        })
      }
      return
    }

    messageApi.error(I18n.t('admin.record_history_request_or_record_required'))
  }

  const handleReset = () => {
    form.resetFields()
    setRange(defaultDateRange())
    setPage(1)
    navigate(RECORD_HISTORY_ROUTE_PATH, { replace: true })
  }

  const disabledDate = (current) => {
    if (!range || !range[0]) {
      return current && current > dayjs().endOf('day')
    }
    const tooLate = range[0] && current.diff(range[0], 'days') > MAX_RANGE_DAYS

    return tooLate || current > dayjs().endOf('day')
  }

  const onCalendarChange = (dates) => {
    setRange(dates)
    if (dates && dates[0] && dates[1]) {
      form.setFields([{ name: 'dateRange', errors: [] }])
    }
  }

  const handleTypeFilter = (type?: string) => {
    setPage(1)
    pushQuery({ ...parsed, auditable_type: type || undefined })
  }

  const handleFieldFilter = (field?: string) => {
    setPage(1)
    pushQuery({ ...parsed, changed_field: field || undefined })
  }

  const showRevision = (entry: AuditHistoryEntry) => {
    if (entry.version == null) return

    setIsRevisionLoading(true)
    setRevisionVersion(entry.version)
    fetchRevision({
      recordType: entry.auditableType,
      recordId: String(entry.auditableId),
      version: entry.version,
    })
      .catch(() => messageApi.error(I18n.t('admin.record_history_revision_failed')))
      .finally(() => setIsRevisionLoading(false))
  }

  const handleExport = () => {
    if (!rootType || !rootId) return

    setIsExportLoading(true)
    exportRecordHistory({
      recordType: rootType,
      recordId: rootId,
      startDate: parsed.start_date,
      endDate: parsed.end_date,
      associatedRecord: parsed.associated_record === 'true',
      auditableType: parsed.auditable_type,
      changedField: parsed.changed_field,
    })
      .then(() => messageApi.success(I18n.t('admin.audit_logs_export_queued')))
      .catch(() => messageApi.error(I18n.t('admin.audit_logs_export_failed')))
      .finally(() => setIsExportLoading(false))
  }

  const handleOpenAuditLog = (auditLogId: number) => {
    navigate(`/admin/audit_logs/${auditLogId}`)
  }

  return (
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
          {
            label: () => I18n.t('admin.record_history_title'),
          },
        ]}
      />

      <AuditLogTabs />

      <div style={{ marginTop: '30px' }}>
        <SearchFilters
          form={form}
          auditableTypes={auditableTypes}
          isExportLoading={isExportLoading}
          hasQuery={hasQuery}
          isRequestMode={isRequestMode}
          onSearch={handleSearch}
          onReset={handleReset}
          onExport={handleExport}
          filterRecordType={filterRecordType}
          disabledDate={disabledDate}
          onCalendarChange={onCalendarChange}
        />
      </div>

      <div className="pl">
        <RecordHistoryResults
          entries={entries}
          total={total}
          isLoading={isLoading}
          hasQuery={hasQuery}
          isRequestMode={isRequestMode}
          requestUuid={requestUuid}
          rootType={rootType}
          rootId={rootId}
          page={page}
          parsed={parsed}
          resultTypes={resultTypes}
          resultFields={resultFields}
          setPage={setPage}
          onTypeFilter={handleTypeFilter}
          onFieldFilter={handleFieldFilter}
          onShowRevision={showRevision}
          onOpenAuditLog={handleOpenAuditLog}
        />
      </div>

      <RevisionPreviewModal
        revisionVersion={revisionVersion}
        isRevisionLoading={isRevisionLoading}
        revisionAttributes={revisionAttributes}
        onClose={() => setRevisionVersion(null)}
      />
    </div>
  )
}

export default connecter(RecordHistory)
