import { useState, useMemo, useEffect } from 'react'
import {
  Modal, Button, Select, Form, Typography, Tag, Flex,
} from 'antd'
import reduce from 'lodash/reduce'
import keyBy from 'lodash/keyBy'
import map from 'lodash/map'
import filter from 'lodash/filter'
import mapValues from 'lodash/mapValues'
import Report from 'modules/admin/modules/campaigns/interfaces/Report'
import {
  FileTextOutlined, DownloadOutlined, GlobalOutlined, ThunderboltOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { constants } from '~/glint/components/DefaultAntThemeWrapper/constants'

interface ReportLanguageValues {
  [reportId: string]: string
}

export interface OwnProps {
  reports: Report[]
  selectedIds: string[]
  handleReportsLanguageSelection(reports: { [key: string]: string[] }): void
  close(): void
  isDownload: boolean
}

const { I18n } = window
const { Paragraph, Text } = Typography

export default function ReportsLanguageSelectionModal ({
  selectedIds, reports, close, handleReportsLanguageSelection, isDownload,
}: OwnProps) {
  const [form] = Form.useForm()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_fields, setFields] = useState({})

  const handleRegenerate = (values: ReportLanguageValues) => {
    const reportValues = mapValues(values, language => [language])
    handleReportsLanguageSelection(reportValues)
    close()
  }

  const selectedReports = useMemo(() => {
    const reportsMap = keyBy(reports, 'id')
    return filter(map(selectedIds, id => reportsMap[id]), Boolean)
  }, [selectedIds, reports])

  const initialValues: Record<string, string> = useMemo(() => reduce(selectedReports, (acc, report: Report) => {
    acc[report.reportId] = report.effectiveDefaultLanguage || report.availableLanguages?.[0] || ''
    return acc
  }, {}), [selectedReports])

  // Reset form when initial values change
  useEffect(() => {
    form.setFieldsValue(initialValues)
  }, [form, initialValues])


  return (
    <Modal
      width={768}
      title={isDownload ? I18n.t('admin.reports_language_selection_modal_download')
        : I18n.t('admin.reports_language_selection_modal_generate')}
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
          icon={isDownload ? <DownloadOutlined /> : <ThunderboltOutlined />}
        >
          {isDownload ? I18n.t('shared.download') : I18n.t('shared.generate')}
        </Button>,
      ]}
    >
      <Paragraph style={{ color: constants.DARK_GREY }} className="mb-4">
        {I18n.t('admin.campaign_report_generate_modal_subtitle')}
      </Paragraph>
      <Form
        name="basic"
        form={form}
        initialValues={initialValues}
        onFieldsChange={(_, allFields) => {
          setFields(allFields)
        }}
        onFinish={handleRegenerate}
        layout="vertical"
        className="mb-8"
      >
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
                    defaultValue={report.effectiveDefaultLanguage?.length || report.availableLanguages?.[0]}
                    disabled={!report.availableLanguages?.length || !report.internal}
                  >
                    {report.effectiveDefaultLanguage ? (
                      <Select.Option key={report.effectiveDefaultLanguage} value={report.effectiveDefaultLanguage}>
                        <Flex align="center" justify="space-between" gap={6}>
                          <Flex gap={4}>
                            <GlobalOutlined style={{ color: constants.DEFAULT_PRIMARY_COLOR }} />
                            {I18n.t(`languages.${report.effectiveDefaultLanguage}`)}
                          </Flex>
                          <Tag color={constants.DEFAULT_PRIMARY_COLOR}>Default</Tag>
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
      </Form>
    </Modal>
  )
}
