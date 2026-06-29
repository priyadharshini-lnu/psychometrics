import { useState, useMemo } from 'react'
import {
  Modal, Button, DatePicker, Select, Checkbox, Form, Flex, Typography, Tag, Divider,
} from 'antd'
import reduce from 'lodash/reduce'
import keyBy from 'lodash/keyBy'
import map from 'lodash/map'
import filter from 'lodash/filter'
import mapValues from 'lodash/mapValues'
import { FileTextOutlined, GlobalOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { PropsFromRedux } from './connect'
import Report from '~/modules/admin/modules/campaigns/interfaces/Report'
import { constants } from '~/glint/components/DefaultAntThemeWrapper/constants'
import dayjs from '~/utils/dayjs'
import { RangeValueType } from '~/interfaces/Antd'

interface FormValues {
  includeInactiveUsers: boolean
  dateRange: RangeValueType
}

interface ReportLanguageValues {
  [reportId: string]: string
}

const dateFormat = 'YYYY-MM-DD HH:mm'

export interface OwnProps {

  selectedIds: string[]
  handleDownloadReports(reports: { [key: string]: string[] }, startDate: dayjs.Dayjs,
    endDate: dayjs.Dayjs, includeInactiveUsers?: boolean): void
  close(): void
}

const { I18n } = window
const { Paragraph, Text } = Typography

type Props = OwnProps & PropsFromRedux


export default function DownloadReportsModal ({
  selectedIds, reports, close, handleDownloadReports,
}: Props) {
  const [form] = Form.useForm()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_fields, setFields] = useState({})

  const handleDownload = (values: FormValues & ReportLanguageValues) => {
    const { dateRange, includeInactiveUsers, ...reportLanguages } = values
    if (!dateRange) return
    const [startDate, endDate] = dateRange
    if (!startDate || !endDate) return
    const convertedReports = mapValues(reportLanguages, language => [language])
    handleDownloadReports(convertedReports, startDate, endDate, includeInactiveUsers)
    close()
  }

  const disabledFutureDate = (current: dayjs.Dayjs): boolean => {
    const today = dayjs().endOf('day')
    if (current > today) return true
    return false
  }

  const selectedReports = useMemo(() => {
    const reportsMap = keyBy(reports, 'id')
    return filter(map(selectedIds, id => reportsMap[id]), Boolean)
  }, [selectedIds, reports])

  const initialValues: Record<string, string> = useMemo(() => reduce(selectedReports, (acc, report: Report) => {
    acc[report.reportId] = report.effectiveDefaultLanguage || report.availableLanguages?.[0] || ''
    return acc
  }, {}), [selectedReports])


  return (
    <Modal
      width={768}
      title={I18n.t('shared.bulk_download')}
      open
      onCancel={close}
      footer={[
        <Button key="back" onClick={close}>{I18n.t('shared.cancel')}</Button>,
        <Button
          type="primary"
          key="submit"
          onClick={() => {
            form.submit()
          }}
        >
          {I18n.t('shared.export')}
        </Button>,
      ]}
    >
      <Paragraph style={{ color: constants.DARK_GREY }} className="mb-4">
        {I18n.t('admin.modal_subtitle')}
      </Paragraph>
      <Form
        name="basic"
        form={form}
        initialValues={initialValues}
        onFieldsChange={(_, allFields) => {
          setFields(allFields)
        }}
        onFinish={handleDownload}
      >
        <Flex>
          <Form.Item
            name="dateRange"
            style={{ flex: '0 0 auto' }}
            rules={[{
              required: true,
              message: I18n.t('admin.data_range_error'),
            }]}
          >
            <DatePicker.RangePicker
              format={dateFormat}
              placeholder={[I18n.t('shared.start_date'),
                I18n.t('shared.end_date')]}
              style={{ width: '100%' }}
              allowClear={false}
              disabledDate={disabledFutureDate}
              showTime
            />
          </Form.Item>
        </Flex>
        <Flex vertical gap={8}>
          {selectedReports?.map((report: Report) => (
            <Flex
              align="center"
              gap={12}
              style={{
                background: '#fafafa',
                border: '1px solid #f0f0f0',
                borderRadius: '4px',
              }}
              className="ps-2 pe-2 pt-2 pb-2"
            >
              <Flex
                flex="1 1 auto"
                align="center"
                gap={8}
              >
                <FileTextOutlined style={{ color: constants.DEFAULT_PRIMARY_COLOR }} />
                <Text>{report.name}</Text>
              </Flex>
              <div style={{ flex: '0 0 250px' }}>
                <Form.Item
                  key={report.reportId}
                  name={report.reportId}
                  style={{ marginBottom: 0 }}
                >
                  <Select
                    placeholder="Select language"
                    defaultValue={report.effectiveDefaultLanguage || report.availableLanguages?.[0]}
                    disabled={!report.availableLanguages?.length || !report.internal}
                  >
                    {report.effectiveDefaultLanguage ? (
                      <Select.Option key={report.effectiveDefaultLanguage} value={report.effectiveDefaultLanguage}>
                        <Flex align="center" justify="space-between" gap={6}>
                          <Flex gap={4}>
                            <GlobalOutlined style={{ color: constants.DEFAULT_PRIMARY_COLOR }} />
                            {I18n.t(`languages.${report.effectiveDefaultLanguage}`)}
                          </Flex>
                          <Tag color={constants.DEFAULT_PRIMARY_COLOR}>{I18n.t('shared.default')}</Tag>
                        </Flex>
                      </Select.Option>
                    ) : null}
                    {report.availableLanguages?.map(locale => (
                      <Select.Option key={locale} value={locale}>
                        <Flex gap={4}>
                          <GlobalOutlined style={{ color: constants.DARK_GREY }} />
                          {I18n.t(`languages.${locale}`)}
                        </Flex>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </Flex>
          ))}
        </Flex>
        <Divider className="mt-6 mb-0" />
        <Flex vertical>
          <Form.Item name="includeInactiveUsers" valuePropName="checked">
            <Checkbox
              className="mt-5"
            >
              {I18n.t('admin.export_with_inactive_users')}
            </Checkbox>
          </Form.Item>
        </Flex>
      </Form>
    </Modal>
  )
}
