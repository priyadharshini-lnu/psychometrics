import React from 'react'
import {
  Modal,
  Form,
  DatePicker,
  Button,
  Input,
  InputNumber,
  Row,
  Col,
  Switch,
  Space,
  Flex,
  Card,
  Table,
  Typography,
  Divider,
} from '@thetalententerprise/glint'
import type { FormInstance } from '@thetalententerprise/glint'
import dayjs, { Dayjs } from 'dayjs'
import {
  FileTextOutlined,
  CaretRightOutlined,
  CalendarOutlined,
  FilterOutlined,
} from '@thetalententerprise/glint/icons'
import { DataReport, RuntimeParameter } from '../core'

const { I18n } = window
const { Text, Title, Paragraph } = Typography

type RuntimeFormValue = Dayjs | string | number | boolean | null | undefined
type RuntimeConfiguration = Record<string, string>
type ReportConfiguration = Record<string, unknown>

interface Props {
  report: DataReport
  open: boolean
  loading: boolean
  onRun(values: RuntimeConfiguration): void
  onClose(): void
}

const parseConfiguration = (configuration: string | null): ReportConfiguration => {
  if (!configuration) return {}

  try {
    const parsed = JSON.parse(configuration)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

const formatParameterLabel = (parameterName: string) => parameterName
  .split('_')
  .map(part => part.charAt(0).toUpperCase() + part.slice(1))
  .join(' ')

const getParameterLabel = (parameterName: string, description?: string | null) => (
  parameterName.endsWith('_date')
    ? formatParameterLabel(parameterName)
    : (description || formatParameterLabel(parameterName))
)

const parseBooleanValue = (value: unknown): boolean | null => {
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false

  return null
}

const getInitialValue = (
  parameter: RuntimeParameter,
  parsedConfiguration: ReportConfiguration,
): RuntimeFormValue => {
  const rawValue = parsedConfiguration[parameter.name]

  if (rawValue === undefined || rawValue === null || rawValue === '') {
    return null
  }

  if (parameter.type === 'date') {
    const dateValue = dayjs(String(rawValue))
    return dateValue.isValid() ? dateValue : null
  }

  if (parameter.type === 'number') {
    const numberValue = Number(rawValue)
    return Number.isNaN(numberValue) ? null : numberValue
  }

  if (parameter.type === 'boolean') {
    return parseBooleanValue(rawValue)
  }

  return String(rawValue)
}

const formatConfigurationValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') {
    return I18n.t('admin.runtime_parameter_not_set')
  }

  if (Array.isArray(value)) {
    if (
      value.length === 2
      && value.every(item => typeof item === 'string' && dayjs(item).isValid())
    ) {
      return `${dayjs(value[0]).format('YYYY-MM-DD')} to ${dayjs(value[1]).format('YYYY-MM-DD')}`
    }

    return value.join(', ')
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}

const getModalSubtitle = (runtimeParameters: RuntimeParameter[]): string => {
  const onlyDateRange = runtimeParameters.length > 0 && runtimeParameters.every(
    parameter => ['start_date', 'end_date'].includes(parameter.name),
  )

  return onlyDateRange
    ? I18n.t('admin.runtime_parameter_modal_subtitle')
    : I18n.t('admin.runtime_parameter_modal_subtitle_generic')
}

const formatReportType = (reportType: string) => I18n.t(`admin.report_types.${reportType}`)

const formatReportScope = (scope: string) => (
  scope === 'global' ? I18n.t('admin.scope_global') : I18n.t('admin.scope_client')
)

const buildRuntimeConfiguration = (
  values: Record<string, RuntimeFormValue>,
): RuntimeConfiguration => Object.fromEntries(
  Object.entries(values)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => {
      if (dayjs.isDayjs(value)) {
        return [key, value.format('YYYY-MM-DD')]
      }

      return [key, String(value)]
    }),
)

const buildDateRangeRules = (
  parameter: RuntimeParameter,
  required: boolean,
  form: FormInstance,
) => [
  ...(required ? [{ required: true }] : []),
  {
    validator: async (_: unknown, value: RuntimeFormValue) => {
      if (!['start_date', 'end_date'].includes(parameter.name)) {
        return
      }

      const startDate = form.getFieldValue('start_date')
      const endDate = form.getFieldValue('end_date')

      if (!startDate && !endDate) {
        return
      }

      if (parameter.name === 'end_date' && startDate && !value) {
        throw new Error(I18n.t('admin.runtime_parameter_date_range_required'))
      }

      if (parameter.name === 'start_date' && endDate && !value) {
        throw new Error(I18n.t('admin.runtime_parameter_date_range_required'))
      }
    },
  },
]

const renderRuntimeInput = (parameter: RuntimeParameter, form: FormInstance) => {
  switch (parameter.type) {
    case 'boolean':
      return <Switch />
    case 'number':
      return <InputNumber style={{ width: '100%' }} />
    case 'date':
      return (
        <DatePicker
          style={{ width: '100%' }}
          suffixIcon={<CalendarOutlined />}
          disabledDate={(current) => {
            if (!current) return false

            if (current.isAfter(dayjs().endOf('day'))) {
              return true
            }

            const startDate = form.getFieldValue('start_date')
            const endDate = form.getFieldValue('end_date')

            if (
              parameter.name === 'end_date'
              && dayjs.isDayjs(startDate)
              && current.isBefore(startDate, 'day')
            ) {
              return true
            }

            if (
              parameter.name === 'start_date'
              && dayjs.isDayjs(endDate)
              && current.isAfter(endDate, 'day')
            ) {
              return true
            }

            return false
          }}
        />
      )
    default:
      return <Input />
  }
}

const MetaItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Flex gap={4} wrap={false}>
    <Text type="secondary">{label}</Text>
    <Text strong>{value}</Text>
  </Flex>
)

const RunReportModal: React.FC<Props> = ({
  report,
  open,
  loading,
  onRun,
  onClose,
}) => {
  const [form] = Form.useForm()
  const parsedConfiguration = parseConfiguration(report.configuration)
  const runtimeParameterNames = report.runtimeParameters.map(parameter => parameter.name)
  const renderDateRow = runtimeParameterNames.includes('start_date')
    && runtimeParameterNames.includes('end_date')
  const readOnlyParameters = Object.entries(parsedConfiguration)
    .filter(([parameterName]) => (
      !runtimeParameterNames.includes(parameterName)
      && !['start_date', 'end_date'].includes(parameterName)
    ))
    .map(([parameterName, value]) => ({
      key: parameterName,
      label: formatParameterLabel(parameterName),
      value: formatConfigurationValue(value),
    }))

  const initialValues = Object.fromEntries(
    report.runtimeParameters.map(parameter => [
      parameter.name,
      getInitialValue(parameter, parsedConfiguration),
    ]),
  )

  const handleFinish = (values: Record<string, RuntimeFormValue>) => {
    onRun(buildRuntimeConfiguration(values))
  }

  const filterColumns = [
    {
      title: I18n.t('admin.runtime_parameter_filter_column'),
      dataIndex: 'label',
      key: 'label',
      width: '38%',
      render: (label: string) => <Text type="secondary">{label}</Text>,
    },
    {
      title: I18n.t('admin.runtime_parameter_value_column'),
      dataIndex: 'value',
      key: 'value',
      render: (value: string) => <Text strong>{value}</Text>,
    },
  ]

  return (
    <Modal
      open={open}
      title={(
        <Space size={10} align="center">
          <FileTextOutlined />
          <Text strong>{I18n.t('admin.runtime_parameter_modal_title')}</Text>
        </Space>
      )}
      footer={null}
      destroyOnHidden
      onCancel={onClose}
      width={620}
    >
      <Flex vertical gap={16}>
        <Card type="inner">
          <Title level={4}>{report.name}</Title>
          <Paragraph type="secondary">
            {getModalSubtitle(report.runtimeParameters)}
          </Paragraph>

          <Divider />

          <Flex align="center" gap={12} wrap="wrap">
            <MetaItem label={I18n.t('admin.report_type')} value={formatReportType(report.reportType)} />
            <Divider orientation="vertical" />
            <MetaItem label={I18n.t('admin.scope')} value={formatReportScope(report.scope)} />
            {report.owner?.name && (
              <>
                <Divider orientation="vertical" />
                <MetaItem label={I18n.t('admin.report_owner')} value={report.owner.name} />
              </>
            )}
          </Flex>
        </Card>

        {readOnlyParameters.length > 0 && (
          <Card
            type="inner"
            size="small"
            title={(
              <Space size={8}>
                <FilterOutlined />
                {I18n.t('admin.runtime_parameter_locked_section_title')}
              </Space>
            )}
          >
            <Table
              size="small"
              pagination={false}
              columns={filterColumns}
              dataSource={readOnlyParameters}
              showHeader
            />
          </Card>
        )}

        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
          onFinish={handleFinish}
        >
          <Card
            type="inner"
            size="small"
            title={(
              <Space size={8}>
                <CalendarOutlined />
                {I18n.t('admin.runtime_parameter_editable_section_title')}
              </Space>
            )}
          >
            {renderDateRow && (
              <Row gutter={12}>
                {report.runtimeParameters
                  .filter(parameter => ['start_date', 'end_date'].includes(parameter.name))
                  .map(parameter => (
                    <Col xs={24} sm={12} key={parameter.name}>
                      <Form.Item
                        name={parameter.name}
                        label={getParameterLabel(parameter.name, parameter.description)}
                        dependencies={['start_date', 'end_date']}
                        rules={buildDateRangeRules(parameter, parameter.required, form)}
                        valuePropName={parameter.type === 'boolean' ? 'checked' : 'value'}
                      >
                        {renderRuntimeInput(parameter, form)}
                      </Form.Item>
                    </Col>
                  ))}
              </Row>
            )}

            {report.runtimeParameters
              .filter(parameter => !(renderDateRow && ['start_date', 'end_date'].includes(parameter.name)))
              .map(parameter => (
                <Form.Item
                  key={parameter.name}
                  name={parameter.name}
                  label={getParameterLabel(parameter.name, parameter.description)}
                  dependencies={['start_date', 'end_date']}
                  rules={buildDateRangeRules(parameter, parameter.required, form)}
                  valuePropName={parameter.type === 'boolean' ? 'checked' : 'value'}
                >
                  {renderRuntimeInput(parameter, form)}
                </Form.Item>
              ))}
          </Card>

          <Divider />

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              size="large"
              icon={!loading ? <CaretRightOutlined /> : undefined}
            >
              {I18n.t('admin.runtime_parameter_submit_button')}
            </Button>
          </Form.Item>
        </Form>
      </Flex>
    </Modal>
  )
}

export default RunReportModal
