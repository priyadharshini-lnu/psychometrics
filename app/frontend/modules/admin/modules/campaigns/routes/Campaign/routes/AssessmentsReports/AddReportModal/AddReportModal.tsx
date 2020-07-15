import React, { useEffect, useState } from 'react'
import ResourceFormModal from 'components/ResourceFormModal'
import {
  Form, Select, Table, Checkbox,
} from 'antd'
import _ from 'lodash'

const { Column } = Table
const { Option } = Select
const { I18n } = window
interface Props {
  campaignId: string
  close(): void
  fetchReportFamilies(campaignId: string): Promise<{ response: ReportFamily[] }>
}

interface ReportFamily {
  id: number
  name: string
  reports: Report[]
}

interface Report {
  id: number
  name: string
}

const operationsOption = ['skip_existing', 'add_with_existing_response', 'add_and_allow_new_response']

const AddReportModal: React.FC<Props> = ({
  campaignId,
  close,
  fetchReportFamilies,
}) => {
  const [reportFamilies, setReportFamilies] = useState<ReportFamily[]>([])

  useEffect(() => {
    fetchReportFamilies(campaignId).then(
      ({ response }) => {
        setReportFamilies(response)
      },
    )
  }, [])

  const reportForSelection = (reportFamilyId: number) => {
    const reportFamily = _.find(reportFamilies,
      (reportFamily: ReportFamily) => reportFamily.id === reportFamilyId)

    return reportFamily?.reports || []
  }

  const transformValues = (values) => {
    let reportIds = _.map(values.reportIds, (value: string, reportId: string) => (value ? reportId : null))
    reportIds = _.compact(reportIds)

    return {
      ...values,
      reportIds,
    }
  }

  return (
    <ResourceFormModal
      resourceName="report"
      requestScope="campaigns"
      resourceBaseUrl={`/administration/new_campaigns/${campaignId}/reports`}
      showSuccessMessages
      close={close}
      scrollToFirstError
      modalProps={{ width: 620 }}
      formProps={{ initialValues: { operation: 'skip_existing' } }}
      transformValues={transformValues}
    >
      {({ form }) => (
        <>
          <Form.Item
            name="reportFamilyId"
            label={I18n.t('campaign_report.column.report_bundle')}
            rules={[{ required: true }]}
          >
            <Select placeholder="Nothing selected">
              {_.map(reportFamilies, (reportFamily: ReportFamily) => (
                <Option key={reportFamily.id} value={reportFamily.id}>{reportFamily.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="operation"
            label={I18n.t('campaign_report.form.operation')}
            rules={[{ required: true }]}
          >
            <Select>
              {_.map(operationsOption, (operation: string) => (
                <Option
                  key={operation}
                  value={operation}
                >
                  {I18n.t(`campaign_report.form.operation_options.${operation}`)}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <div className="horizontalLabels">
            <Table
              rowKey="id"
              size="small"
              dataSource={reportForSelection(form.getFieldValue('reportFamilyId'))}
              pagination={false}
            >
              <Column
                title={I18n.t('campaign_report.form.report')}
                width="80%"
                render={({ id, name }) => (
                  <Form.Item
                    name={['reportIds', `${id}`]}
                    valuePropName="checked"
                    label={name}
                    labelCol={{ span: 22 }}
                    wrapperCol={{ span: 2 }}
                  >
                    <Checkbox />
                  </Form.Item>
                )}
              />
              <Column
                width="20%"
                align="center"
                title={I18n.t('campaign_report.column.user_access')}
                render={({ id }) => (
                  <Form.Item name={['reportAccess', `${id}`]} valuePropName="checked">
                    <Checkbox />
                  </Form.Item>
                )}
              />
            </Table>
          </div>
        </>
      )}
    </ResourceFormModal>
  )
}

export default AddReportModal
