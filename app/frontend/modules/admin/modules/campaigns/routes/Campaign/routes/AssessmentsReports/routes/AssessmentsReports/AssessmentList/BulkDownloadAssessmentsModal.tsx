import React, { useMemo } from 'react'
import {
  Modal, Button, DatePicker, Select, Checkbox, Form, Flex, Typography, Divider,
} from 'antd'
import keyBy from 'lodash/keyBy'
import { FileTextOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import dayjs from '~/utils/dayjs'
import Assessment from '~/modules/admin/modules/campaigns/interfaces/Assessment'
import { constants } from '~/glint/components/DefaultAntThemeWrapper/constants'
import { RangeValueType } from '~/interfaces/Antd'

const { I18n } = window
const { Paragraph, Text } = Typography

export type ExportType = 'raw_factor_scores' | 'norm_factor_scores'

interface FormValues {
  includeInactiveUsers?: boolean
  dateRange: RangeValueType
  exportType: ExportType
}

interface Props {
  selectedIds: number[]
  assessments: Assessment[]
  close: () => void
  loading: boolean
  onSubmit: (params: {
    exportType: ExportType
    startDate: Date
    endDate: Date
    includeInactiveUsers: boolean
  }) => void
}

const format = 'YYYY-MM-DD HH:mm'

const BulkDownloadAssessmentsModal: React.FC<Props> = ({
  selectedIds,
  assessments,
  close,
  loading,
  onSubmit,
}) => {
  const [form] = Form.useForm()

  const selectedAssessments = useMemo(() => {
    const assessmentMap = keyBy(assessments, 'id')
    return selectedIds
      .map(id => assessmentMap[id])
      .filter((assessment): assessment is Assessment => !!assessment)
  }, [selectedIds, assessments])

  const handleSubmit = (values: FormValues) => {
    if (!values.dateRange || !values.exportType) return

    const [startDate, endDate] = values.dateRange
    if (!startDate || !endDate) return

    onSubmit({
      exportType: values.exportType,
      startDate: startDate.toDate(),
      endDate: endDate.toDate(),
      includeInactiveUsers: !!values.includeInactiveUsers,
    })
  }

  const disableFutureDate = (current: dayjs.Dayjs): boolean => current > dayjs().endOf('day')

  return (
    <Modal
      width={768}
      title={I18n.t('campaign_report.actions.bulk_download')}
      open
      onCancel={close}
      footer={[
        <Button key="cancel" onClick={close}>{I18n.t('common.actions.cancel')}</Button>,
        <Button key="export" type="primary" loading={loading} onClick={() => form.submit()}>
          {I18n.t('common.actions.export')}
        </Button>,
      ]}
    >
      <Paragraph style={{ color: constants.DARK_GREY }} className="mb-4">
        {I18n.t('admin.bulk_assessment_download_modal_subtitle')}
      </Paragraph>
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item
          name="dateRange"
          style={{ marginBottom: 12 }}
          rules={[{ required: true, message: I18n.t('admin.bulk_assessment_download_date_range_required') }]}
        >
          <DatePicker.RangePicker
            format={format}
            placeholder={[
              I18n.t('glint.schedule_availability.start_date'),
              I18n.t('glint.schedule_availability.end_date'),
            ]}
            style={{ width: '50%' }}
            allowClear={false}
            disabledDate={disableFutureDate}
            showTime
          />
        </Form.Item>

        <Form.Item
          label={I18n.t('admin.bulk_assessment_download_export_type')}
          name="exportType"
          style={{ width: '50%' }}
          rules={[{ required: true, message: I18n.t('admin.bulk_assessment_download_export_type_required') }]}
        >
          <Select
            options={[
              { label: I18n.t('admin.bulk_assessment_download_raw_factor_scores'), value: 'raw_factor_scores' },
              { label: I18n.t('admin.bulk_assessment_download_norm_factor_scores'), value: 'norm_factor_scores' },
            ]}
          />
        </Form.Item>

        <Flex vertical gap={8}>
          {selectedAssessments.map(assessment => (
            <Flex
              key={assessment.id}
              align="center"
              gap={12}
              style={{
                background: '#fafafa',
                border: '1px solid #f0f0f0',
                borderRadius: 4,
              }}
              className="ps-2 pe-2 pt-2 pb-2"
            >
              <FileTextOutlined style={{ color: constants.DEFAULT_PRIMARY_COLOR }} />
              <Text>{assessment.name}</Text>
            </Flex>
          ))}
        </Flex>

        <Divider className="mt-5 mb-0" />

        <Form.Item name="includeInactiveUsers" valuePropName="checked" className="mt-4 mb-0">
          <Checkbox>{I18n.t('user.modals.exports.include_inactive_users')}</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default BulkDownloadAssessmentsModal
