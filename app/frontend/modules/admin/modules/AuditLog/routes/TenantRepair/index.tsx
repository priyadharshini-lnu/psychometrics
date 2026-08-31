import React, { useState, useRef } from 'react'
import {
  Form, Select, Button, Card, Descriptions, Input, Modal, Typography, Space, App, Row, Col, Empty,
} from 'antd'
import AuditLogTabs from '../../components/Tabs'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import { TENANT_REPAIR_PREVIEW_URL, TENANT_REPAIR_UPDATE_TENANT_URL, TENANT_REPAIR_SEARCH_MODELS_URL } from '../../core'

const { Title, Text } = Typography
const { I18n } = window

const csrfToken = (): string => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''

interface PreviewData {
  id: number
  tenant_id: number | null
  tenant_name: string | null
  resolved_tenant_id: number | null
  resolved_tenant_name: string | null
  resolved_tenant_supported: boolean
  [key: string]: unknown
}

interface CorrectResult {
  model_type: string
  record_id: number
  old_tenant_id: number | null
  new_tenant_id: number | null
}

const TENANT_DERIVING_COLUMNS = ['owner_id', 'project_id', 'client_id', 'campaign_id']
const SEARCH_DEBOUNCE_MS = 300

function parseOptionalPositiveInteger (value: unknown): { valid: boolean; value: number | null } {
  if (value === null || value === undefined) return { valid: true, value: null }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return { valid: true, value: null }
    if (!/^\d+$/.test(trimmed)) return { valid: false, value: null }

    const parsed = Number(trimmed)
    if (!Number.isInteger(parsed) || parsed <= 0) return { valid: false, value: null }
    return { valid: true, value: parsed }
  }

  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return { valid: true, value }
  }

  return { valid: false, value: null }
}

function extractApiError (data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') return fallback
  const d = data as Record<string, unknown>
  if (typeof d.error === 'string') return d.error
  if (Array.isArray(d.errors) && d.errors[0]) {
    const e = d.errors[0] as Record<string, string>
    return e.detail || e.title || fallback
  }
  if (Array.isArray(data)) {
    const e = (data as Record<string, string>[])[0]
    return e?.detail || e?.title || fallback
  }
  return fallback
}

async function apiFetch<T> (url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken(),
      ...options.headers,
    },
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(extractApiError(data, I18n.t('admin.tenant_repair_request_failed')))
  }

  return data as T
}

const TenantRepair: React.FC = () => {
  const { message: messageApi } = App.useApp()
  const [searchForm] = Form.useForm()
  const [correctForm] = Form.useForm()
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [modelOptions, setModelOptions] = useState<{ value: string; label: string }[]>([])
  const [isSearchingModels, setIsSearchingModels] = useState(false)
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [correctResult, setCorrectResult] = useState<CorrectResult | null>(null)
  const [isFinding, setIsFinding] = useState(false)
  const [isCorrecting, setIsCorrecting] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [findError, setFindError] = useState<string | null>(null)
  const watchedNewTenantId = Form.useWatch('newTenantId', correctForm)
  const parsedNewTenantId = parseOptionalPositiveInteger(watchedNewTenantId)

  const handleModelSearch = (query: string) => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    if (!query.trim()) {
      setModelOptions([])
      return
    }
    searchDebounceRef.current = setTimeout(async () => {
      setIsSearchingModels(true)
      try {
        const params = new URLSearchParams({ q: query })
        const types = await apiFetch<string[]>(`${TENANT_REPAIR_SEARCH_MODELS_URL}?${params}`)
        setModelOptions(types.map(t => ({ value: t, label: t })))
      } catch {
        // silently ignore — user can still type the class name manually
      } finally {
        setIsSearchingModels(false)
      }
    }, SEARCH_DEBOUNCE_MS)
  }

  const handleFind = async (values: { modelType: string; recordId: string | number }) => {
    setIsFinding(true)
    setPreview(null)
    setCorrectResult(null)
    setFindError(null)
    correctForm.resetFields()

    const parsedRecordId = Number(String(values.recordId).trim())

    const params = new URLSearchParams({
      model_type: values.modelType,
      record_id: String(parsedRecordId),
    })

    try {
      const data = await apiFetch<PreviewData>(`${TENANT_REPAIR_PREVIEW_URL}?${params}`)
      setPreview(data)
    } catch (err) {
      setFindError(err instanceof Error ? err.message : I18n.t('admin.tenant_repair_request_failed'))
    } finally {
      setIsFinding(false)
    }
  }

  const handleCorrectConfirm = async () => {
    const newTenantId = parseOptionalPositiveInteger(correctForm.getFieldValue('newTenantId')).value
    if (!preview) return

    setIsConfirmOpen(false)
    setIsCorrecting(true)

    try {
      const result = await apiFetch<CorrectResult>(TENANT_REPAIR_UPDATE_TENANT_URL, {
        method: 'POST',
        body: JSON.stringify({
          model_type: searchForm.getFieldValue('modelType'),
          record_id: preview.id,
          new_tenant_id: newTenantId ?? null,
        }),
      })
      setCorrectResult(result)
      setPreview(null)
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : I18n.t('admin.tenant_repair_request_failed'))
    } finally {
      setIsCorrecting(false)
    }
  }

  const globalLabel = I18n.t('admin.tenant_repair_global_tenant')

  const resolvedTenantIdDisplay = (() => {
    if (!preview?.resolved_tenant_supported) return '—'
    return preview.resolved_tenant_id !== null ? preview.resolved_tenant_id : 'null'
  })()

  const resolvedTenantNameDisplay = (() => {
    if (!preview?.resolved_tenant_supported) return '—'
    return preview.resolved_tenant_name || globalLabel
  })()

  const previewDescriptionItems = preview
    ? [
      { key: 'id', label: 'id', children: preview.id },
      { key: 'tenant_id', label: 'tenant_id', children: preview.tenant_id !== null ? preview.tenant_id : 'null' },
      {
        key: 'tenant_name',
        label: I18n.t('admin.tenant_repair_current_tenant'),
        children: preview.tenant_name || globalLabel,
      },
      {
        key: 'resolved_tenant_id',
        label: 'resolved_tenant_id',
        children: resolvedTenantIdDisplay,
      },
      {
        key: 'resolved_tenant',
        label: I18n.t('admin.tenant_repair_resolved_tenant'),
        children: resolvedTenantNameDisplay,
      },
      ...TENANT_DERIVING_COLUMNS
        .filter(col => preview[col] !== undefined)
        .map(col => ({ key: col, label: col, children: String(preview[col]) })),
    ]
    : []

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
            label: () => I18n.t('admin.tenant_repair_title'),
          },
        ]}
      />

      <AuditLogTabs />

      <div style={{ maxWidth: 960, margin: '32px auto', padding: '0 24px' }}>
        <Title level={4}>{I18n.t('admin.tenant_repair_title')}</Title>

        <Card style={{ marginBottom: 24 }}>
          <Form form={searchForm} onFinish={handleFind}>
            <Row gutter={[16, 16]} align="top" wrap>
              <Col xs={24} sm={12} md={10}>
                <Form.Item
                  name="modelType"
                  label={I18n.t('admin.tenant_repair_model_label')}
                  rules={[{ required: true }]}
                >
                  <Select
                    showSearch
                    filterOption={false}
                    onSearch={handleModelSearch}
                    loading={isSearchingModels}
                    options={modelOptions}
                    placeholder={I18n.t('admin.tenant_repair_model_placeholder')}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="recordId"
                  label="ID"
                  rules={[
                    { required: true, message: I18n.t('admin.tenant_repair_invalid_record_id') },
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.resolve()
                        const parsed = Number(String(value).trim())
                        if (Number.isInteger(parsed) && parsed > 0) return Promise.resolve()
                        return Promise.reject(new Error(I18n.t('admin.tenant_repair_invalid_record_id')))
                      },
                    },
                  ]}
                >
                  <Input inputMode="numeric" />
                </Form.Item>
              </Col>
              <Col xs={24} md={6} style={{ textAlign: 'right' }}>
                <Form.Item label=" " colon={false}>
                  <Button type="primary" htmlType="submit" loading={isFinding}>
                    {I18n.t('admin.tenant_repair_find_record')}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        {findError && (
          <Card style={{ marginBottom: 24 }}>
            <Empty description={findError} />
          </Card>
        )}

        {preview && (
          <Card title={I18n.t('admin.tenant_repair_preview_title')} style={{ marginBottom: 24 }}>
            <Descriptions
              bordered
              size="small"
              column={1}
              items={previewDescriptionItems}
              style={{ marginBottom: 24 }}
            />

            <Form form={correctForm} layout="vertical" style={{ maxWidth: 460 }}>
              <Row gutter={[12, 12]} align="top" wrap>
                <Col xs={24} sm={16} md={16}>
                  <Form.Item
                    name="newTenantId"
                    label={I18n.t('admin.tenant_repair_new_tenant_id_label')}
                    extra={parsedNewTenantId.valid && parsedNewTenantId.value !== null
                      ? I18n.t('admin.tenant_repair_will_set_value', { value: parsedNewTenantId.value })
                      : I18n.t('admin.tenant_repair_will_set_null')}
                    rules={[{
                      validator: (_, value) => {
                        const parsedValue = parseOptionalPositiveInteger(value)
                        if (parsedValue.valid) return Promise.resolve()
                        return Promise.reject(new Error(I18n.t('admin.tenant_repair_invalid_tenant_id')))
                      },
                    }]}
                  >
                    <Input inputMode="numeric" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8} md={8} style={{ textAlign: 'right' }}>
                  <Form.Item label=" " colon={false}>
                    <Button
                      type="primary"
                      danger
                      loading={isCorrecting}
                      onClick={() => correctForm.validateFields().then(() => setIsConfirmOpen(true))}
                    >
                      {I18n.t('admin.tenant_repair_update')}
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        )}

        {correctResult && (
          <Card>
            <Space direction="vertical">
              <Text type="success">{I18n.t('admin.tenant_repair_success')}</Text>
              <Text>
                {correctResult.model_type}
                {' '}
                #
                {correctResult.record_id}
                {' — '}
                {I18n.t('admin.tenant_repair_moved_from')}
                {' '}
                {correctResult.old_tenant_id ?? 'null'}
                {' '}
                {I18n.t('admin.tenant_repair_moved_to')}
                {' '}
                {correctResult.new_tenant_id ?? 'null'}
              </Text>
            </Space>
          </Card>
        )}

        <Modal
          open={isConfirmOpen}
          title={I18n.t('admin.tenant_repair_confirm_title')}
          onOk={handleCorrectConfirm}
          onCancel={() => setIsConfirmOpen(false)}
          okType="danger"
          okText={I18n.t('admin.tenant_repair_update')}
        >
          <Text>
            {parsedNewTenantId.value !== null
              ? I18n.t('admin.tenant_repair_confirm_message', {
                model: searchForm.getFieldValue('modelType'),
                id: preview?.id,
                new_tenant: parsedNewTenantId.value,
              })
              : I18n.t('admin.tenant_repair_confirm_message_null', {
                model: searchForm.getFieldValue('modelType'),
                id: preview?.id,
              })}
          </Text>
        </Modal>
      </div>
    </div>
  )
}

export default TenantRepair
