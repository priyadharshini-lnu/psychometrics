import React from 'react'
import {
  Row, Col, Space, Select, Card, Tag, Collapse, Empty, Pagination, Alert, Typography, Button,
} from 'antd'
import dayjs from '~/utils/dayjs'
import { ResourceAvatar } from '~/glint/components/ResourceAvatar'
import { PageContentSkeleton } from '~/modules/endUser/modules/campaigns/components/PageContentSkeleton'
import { DEFAULT_PAGE_SIZE } from '~/constants/campaign'
import JsonDiff from '../../AuditLogInfo/JsonDiff'
import { AuditHistoryEntry } from '~/modules/admin/modules/AuditLog/core'
import {
  ACTION_COLORS,
  changedFieldNames,
  filterRecordType,
  groupByDay,
  groupByRequest,
  recordLabel,
} from '../helpers'
import { RequestGroup } from '../types'

const { I18n } = window
const { Text } = Typography

type Props = {
  entries: AuditHistoryEntry[]
  total: number
  isLoading: boolean
  hasQuery: boolean
  isRequestMode: boolean
  requestUuid?: string
  rootType?: string
  rootId?: string
  page: number
  parsed: Record<string, string>
  resultTypes: string[]
  resultFields: string[]
  setPage: (nextPage: number) => void
  onTypeFilter: (type?: string) => void
  onFieldFilter: (field?: string) => void
  onShowRevision: (entry: AuditHistoryEntry) => void
  onOpenAuditLog: (auditLogId: number) => void
}

const renderChanges = (entry: AuditHistoryEntry) => {
  const { action, auditedChanges } = entry

  if (action === 'update') {
    return Object.keys(auditedChanges || {}).map(key => (
      <div key={key} className="mt-5 mb-5">
        {key}
        :
        <JsonDiff
          oldChanges={auditedChanges[key]?.[0]}
          newChanges={auditedChanges[key]?.[1]}
        />
      </div>
    ))
  }

  if (action === 'create') {
    return <JsonDiff oldChanges={{}} newChanges={auditedChanges} />
  }

  return <JsonDiff oldChanges={auditedChanges} newChanges={{}} />
}

const RecordHistoryResults: React.FC<Props> = ({
  entries,
  total,
  isLoading,
  hasQuery,
  isRequestMode,
  requestUuid,
  rootType,
  rootId,
  page,
  parsed,
  resultTypes,
  resultFields,
  setPage,
  onTypeFilter,
  onFieldFilter,
  onShowRevision,
  onOpenAuditLog,
}) => {
  const isRelated = (entry: AuditHistoryEntry) => (
    !isRequestMode && (entry.auditableType !== rootType || String(entry.auditableId) !== String(rootId))
  )

  const renderEntryTags = (entry: AuditHistoryEntry) => (
    <Space wrap size={6}>
      <Tag color={ACTION_COLORS[entry.action] || 'default'}>{entry.action}</Tag>
      <strong>{recordLabel(entry)}</strong>
      {isRelated(entry) && <Tag color="purple">{I18n.t('admin.record_history_related_tag')}</Tag>}
      {entry.version != null && (
        <Space size={4}>
          <Tag color="processing">{`${I18n.t('admin.record_history_version')} ${entry.version}`}</Tag>
          <Button
            type="link"
            size="small"
            style={{ paddingInline: 0, height: 'auto' }}
            onClick={() => onShowRevision(entry)}
          >
            {I18n.t('shared.view')}
          </Button>
        </Space>
      )}
    </Space>
  )

  const renderChangesCollapse = (entry: AuditHistoryEntry) => {
    const fields = changedFieldNames(entry)
    const preview = fields.slice(0, 3).join(', ')
    const extra = fields.length > 3 ? ` +${fields.length - 3}` : ''

    return (
      <Collapse
        className="mt-4"
        items={[
          {
            key: String(entry.id),
            label: (
              <Space size={6}>
                <span>{I18n.t('admin.active_record_audits_audited_changes')}</span>
                {fields.length > 0 && (
                  <Text type="secondary" style={{ fontWeight: 400 }}>{`${preview}${extra}`}</Text>
                )}
              </Space>
            ),
            children: renderChanges(entry),
          },
        ]}
      />
    )
  }

  const renderRequestCard = (group: RequestGroup) => {
    const [first] = group.entries
    const { auditLogId } = first
    const actorName = first.user ? first.user.fullName : I18n.t('admin.record_history_system')
    const isSystem = !first.user

    return (
      <Card size="small" key={group.key} style={{ marginBottom: 12 }}>
        <Row justify="space-between" align="middle" gutter={[8, 8]}>
          <Col>
            <Space size={8}>
              <Text strong>{I18n.t('admin.record_history_request_label')}</Text>
              {group.requestUuid ? (
                <Tag color="geekblue">{group.requestUuid}</Tag>
              ) : (
                <Text type="secondary">{I18n.t('admin.record_history_system')}</Text>
              )}
            </Space>
          </Col>
          <Col>
            <Space size={12} wrap>
              {group.entries.length > 1 && (
                <Tag color="geekblue">
                  {`${group.entries.length} ${I18n.t('admin.record_history_records_changed')}`}
                </Tag>
              )}
              {auditLogId != null && (
                <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => onOpenAuditLog(auditLogId)}>
                  {I18n.t('admin.record_history_view_audit_log')}
                </Button>
              )}
            </Space>
          </Col>
        </Row>
        <Space size={8} style={{ marginTop: 8 }}>
          <ResourceAvatar size="small" name={actorName} color={isSystem ? '#bfbfbf' : undefined} />
          <Text>{actorName}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {first.createdAt ? dayjs(first.createdAt).format('h:mm A') : ''}
          </Text>
        </Space>
        <div style={{ marginTop: 12 }}>
          {group.entries.map(entry => (
            <div key={entry.id} style={{ marginTop: 8 }}>
              {renderEntryTags(entry)}
              {renderChangesCollapse(entry)}
            </div>
          ))}
        </div>
      </Card>
    )
  }

  const emptyDescription = () => {
    if (!rootType || !rootId) return I18n.t('admin.record_history_no_results')

    const range = parsed.start_date && parsed.end_date
      ? ` (${dayjs(parsed.start_date).format('MMM D')} – ${dayjs(parsed.end_date).format('MMM D, YYYY')})`
      : ''

    return `${I18n.t('admin.record_history_no_results_for')} ${rootType} #${rootId}${range}`
  }

  if (isLoading) {
    return <PageContentSkeleton />
  }

  if (!hasQuery) {
    return <Empty description={I18n.t('admin.record_history_search_hint')} />
  }

  return (
    <>
      {isRequestMode && (
        <Alert
          type="info"
          showIcon
          className="mb-4"
          message={(
            <Space size={8}>
              <span>
                {I18n.t('admin.record_history_request_banner')}
                :
              </span>
              <Tag color="geekblue">{requestUuid}</Tag>
            </Space>
          )}
        />
      )}
      <Row justify="space-between" align="middle" className="pm">
        <Col className="pls">
          <Text strong>{`${total} ${I18n.t('admin.record_history_changes')}`}</Text>
        </Col>
        <Col>
          <Space wrap>
            {(isRequestMode || parsed.associated_record === 'true')
              && (resultTypes.length > 1 || parsed.auditable_type) && (
                <Select
                  allowClear
                  showSearch
                  style={{ minWidth: 200 }}
                  placeholder={I18n.t('admin.record_history_filter_type')}
                  value={parsed.auditable_type || undefined}
                  onChange={onTypeFilter}
                  filterOption={filterRecordType}
                  options={resultTypes.map(type => ({ label: type, value: type }))}
                />
            )}
            {(resultFields.length > 1 || parsed.changed_field) && (
              <Select
                allowClear
                showSearch
                style={{ minWidth: 200 }}
                placeholder={I18n.t('admin.record_history_filter_field')}
                value={parsed.changed_field || undefined}
                onChange={onFieldFilter}
                options={resultFields.map(field => ({ label: field, value: field }))}
              />
            )}
          </Space>
        </Col>
      </Row>
      {entries.length === 0 ? (
        <Empty description={emptyDescription()} />
      ) : (
        <>
          <div className="mtm">
            {groupByDay(groupByRequest(entries)).map(day => (
              <div key={day.key}>
                <Text type="secondary" strong style={{ display: 'block', margin: '16px 0 8px', fontSize: 13 }}>
                  {day.label}
                </Text>
                {day.groups.map(group => renderRequestCard(group))}
              </div>
            ))}
          </div>
          <div className="pl">
            <Pagination
              current={page}
              pageSize={DEFAULT_PAGE_SIZE}
              total={total}
              onChange={setPage}
              hideOnSinglePage
            />
          </div>
        </>
      )}
    </>
  )
}

export default RecordHistoryResults
