import React, { useEffect } from 'react'
import type { FormInstance } from 'antd'
import {
  Row, Col, Input, Space, Button, Select, Form, Checkbox, DatePicker,
} from 'antd'
import dayjs from '~/utils/dayjs'
import { SearchOutlined, DownloadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { RangeValueType } from '~/interfaces/Antd'
import { SearchFormValues } from '../types'

const { I18n } = window

type Props = {
  form: FormInstance<SearchFormValues>
  auditableTypes: string[]
  isExportLoading: boolean
  hasQuery: boolean
  isRequestMode: boolean
  onSearch: (values: SearchFormValues) => void
  onReset: () => void
  onExport: () => void
  filterRecordType: (input: string, option?: { label?: string; value?: string }) => boolean
  disabledDate: (current: dayjs.Dayjs) => boolean
  onCalendarChange: (dates: RangeValueType | null) => void
}

const SearchFilters: React.FC<Props> = ({
  form,
  auditableTypes,
  isExportLoading,
  hasQuery,
  isRequestMode,
  onSearch,
  onReset,
  onExport,
  filterRecordType,
  disabledDate,
  onCalendarChange,
}) => {
  const requestUuid = Form.useWatch('requestUuid', form)
  const hasRequestUuid = Boolean(requestUuid?.trim())

  useEffect(() => {
    if (!hasRequestUuid) return

    form.setFieldsValue({
      recordType: undefined,
      recordId: undefined,
      associatedRecord: false,
      dateRange: undefined,
    })
    form.setFields([{ name: 'dateRange', errors: [] }])
  }, [form, hasRequestUuid])

  return (
    <Form form={form} layout="vertical" onFinish={onSearch} className="ms-5 me-5">
      <Row gutter={[16, 16]} justify="start" align="bottom">
        <Col xs={24} sm={12} md={8} lg={6}>
          <Form.Item
            name="recordType"
            label={I18n.t('admin.audit_log_type')}
          >
            <Select
              placeholder={I18n.t('admin.record_history_select_type')}
              showSearch
              allowClear
              disabled={hasRequestUuid}
              filterOption={filterRecordType}
              options={auditableTypes.map(type => ({ label: type, value: type }))}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={5}>
          <Form.Item
            name="recordId"
            label={I18n.t('admin.record_id')}
          >
            <Input placeholder={I18n.t('admin.search_record')} disabled={hasRequestUuid} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={7}>
          <Form.Item name="dateRange" label={I18n.t('admin.date_range')}>
            <DatePicker.RangePicker
              style={{ width: '100%' }}
              disabled={hasRequestUuid}
              disabledDate={disabledDate}
              onCalendarChange={onCalendarChange}
              presets={[
                {
                  label: I18n.t('admin.record_history_last_7_days'),
                  value: [dayjs().subtract(6, 'day').startOf('day'), dayjs().endOf('day')],
                },
                {
                  label: I18n.t('admin.record_history_last_30_days'),
                  value: [dayjs().subtract(29, 'day').startOf('day'), dayjs().endOf('day')],
                },
              ]}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Form.Item name="associatedRecord" valuePropName="checked" label=" ">
            <Checkbox disabled={hasRequestUuid}>{I18n.t('admin.record_history_include_related')}</Checkbox>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 16]} justify="start" align="bottom">
        <Col xs={24} sm={12} md={8} lg={6}>
          <Form.Item
            name="requestUuid"
            label={I18n.t('admin.record_history_request_uuid')}
          >
            <Input placeholder={I18n.t('admin.record_history_request_uuid_placeholder')} />
          </Form.Item>
        </Col>
        <Col span={24} style={{ textAlign: 'right' }}>
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SearchOutlined />}
              >
                {I18n.t('shared.search')}
              </Button>
              <Button onClick={onReset}>{I18n.t('shared.reset')}</Button>
              <Button
                loading={isExportLoading}
                onClick={onExport}
                disabled={!hasQuery || isRequestMode}
                icon={<DownloadOutlined />}
              >
                {I18n.t('admin.export_to_csv')}
              </Button>
            </Space>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  )
}

export default SearchFilters
