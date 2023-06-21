import React, { useEffect, useState } from 'react'
import {
  Form, Select, Table, Checkbox, Radio, Space,
} from 'antd'
import _ from 'lodash'

import ResourceFormModal from '~/components/ResourceFormModal'

import { Strategies } from './interfaces'

const { I18n } = window

interface Props {
  campaignId: string
  userId?: number
  strategy: Strategies
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

const OPTIONS_BY_STRATEGY = {
  [Strategies.SINGLE]: ({ campaignId, userId }) => ({
    requestScope: 'userReport',
    resourceBaseUrl: `/administration/new_campaigns/${campaignId}/users/${userId}/user_reports`,
    operationsOption: ['add_with_existing_response', 'add_and_allow_new_response'],
  }),
  [Strategies.MULTIPLE]: ({ campaignId }) => ({
    requestScope: 'campaigns',
    resourceBaseUrl: `/administration/new_campaigns/${campaignId}/reports`,
    operationsOption: ['skip_existing', 'add_with_existing_response', 'add_and_allow_new_response'],
  }),
}

const AddReportModal: React.FC<Props> = ({
  campaignId,
  userId,
  strategy,
  close,
  fetchReportFamilies,
}) => {
  const [reportFamilies, setReportFamilies] = useState<ReportFamily[]>([])

  const { requestScope, resourceBaseUrl, operationsOption } = OPTIONS_BY_STRATEGY[strategy]({ campaignId, userId })

  useEffect(() => {
    fetchReportFamilies(campaignId).then(
      ({ response }) => {
        setReportFamilies(response)
      },
    )
  }, [])

  const reportForSelection = (reportFamilyId: number) => {
    const reportFamily = _.find(reportFamilies, (reportFamily: ReportFamily) => reportFamily.id === reportFamilyId)

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
      readableResourceName="Report"
      requestScope={requestScope}
      resourceBaseUrl={resourceBaseUrl}
      showSuccessMessages
      close={close}
      scrollToFirstError
      modalProps={{ width: 620 }}
      formProps={{ initialValues: { operation: operationsOption[0] } }}
      transformValues={transformValues}
    >
      {({ form }) => (
        <>
          <Form.Item
            name="reportFamilyId"
            label={I18n.t('campaign_report.column.report_bundle')}
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              placeholder={I18n.t('campaign_report.form.report_bundle_placeholder')}
              optionFilterProp="children"
              filterOption={(input, option) => option?.key.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
              {_.map(reportFamilies, (reportFamily: ReportFamily) => (
                <Select.Option key={reportFamily.name} value={reportFamily.id}>
                  {reportFamily.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="operation"
            label={I18n.t('campaign_report.form.operation')}
            rules={[{ required: true }]}
          >
            <Radio.Group>
              <Space direction="vertical">
                {operationsOption.map(operation => (
                  <Radio value={operation}>
                    {I18n.t(
                      `campaign_report.form.operation_options.${operation}`,
                    )}
                  </Radio>
                ))
                }
              </Space>
            </Radio.Group>
          </Form.Item>
          <div className="horizontalLabels">
            <Table
              rowKey="id"
              size="small"
              dataSource={reportForSelection(form.getFieldValue('reportFamilyId'))}
              pagination={false}
            >
              <Table.Column
                title={I18n.t('campaign_report.form.report')}
                width="80%"
                render={({ id, name }) => (
                  <Form.Item
                    name={['reportIds', `${id}`]}
                    valuePropName="checked"
                    wrapperCol={{ span: 24 }}
                  >
                    <Checkbox>{name}</Checkbox>
                  </Form.Item>
                )}
              />
              <Table.Column
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
