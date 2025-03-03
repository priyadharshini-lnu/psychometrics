import {
  Collapse,
  Form, Select, Space, Spin, Switch,
} from 'antd'
import _ from 'lodash'
import { Report, ReportTR } from '~/modules/admin/modules/campaigns/core/reportList'
import { User, UserTR } from '~/modules/admin/modules/campaigns/core/user'
import { CreateResource, UpdateResource } from '~/hooks/useResources/interfaces'
import ResourceFormModal from '~/components/ResourceFormModal'
import { useResources } from '~/hooks/useResources'
import { AdditionRelationshipAttribute } from '~/libs/jsonApi/interfaces'
import { ReportApprovalSettings } from '~/modules/admin/modules/campaigns/core/reportApprovalSettings'

const { Option } = Select
const { I18n } = window

interface Props {
  reportApprovalSettings: AdditionRelationshipAttribute<ReportApprovalSettings>
  addReportApprovalSetting: CreateResource<ReportApprovalSettings>
  updateReportApprovalSetting: UpdateResource<ReportApprovalSettings>
  campaignId: string
  close(): void
}

type FormValueObj = {
  approvalNotificationUserIds: string[],
  approverUserIds: string[],
  qcUserIds: string[],
  reportId: string,
}

const getOptionsFromApprovalSettings = (reportApprovalSettings, dataKey, fetchedData) => (
  reportApprovalSettings?.[dataKey]
    ? _.uniqBy(fetchedData.concat(reportApprovalSettings[dataKey]), ({ id }: { id: string}) => id.toString())
    : fetchedData
)

const getUserIds = users => users.map(user => user.id)

export const ReportApprovalFormModal: React.FC<Props> = ({
  reportApprovalSettings,
  addReportApprovalSetting,
  updateReportApprovalSetting,
  campaignId,
  close,
}) => {
  const [form] = Form.useForm()
  const {
    data: reports, fetch: fetchReports, isLoading: isReportsLoading,
  } = useResources<Report>('reports', { responseType: ReportTR })
  const {
    data: qcUsers, fetch: fetchQcUsers, isLoading: isQcUsersLoading,
  } = useResources<User>('users', { responseType: UserTR })
  const {
    data: approverUsers, fetch: fetchApproverUsers, isLoading: isApproverUsersLoading,
  } = useResources<User>('users', { responseType: UserTR })
  const {
    data: notificationUsers, fetch: fetchNotificationUsers, isLoading: isNotificationUsersLoading,
  } = useResources<User>('users', { responseType: UserTR })

  const reportApprovalSettingsFormData = reportApprovalSettings ? {
    ...reportApprovalSettings,
    qcUserIds: getUserIds(reportApprovalSettings.qcs),
    approverUserIds: getUserIds(reportApprovalSettings.approvers),
    approvalNotificationUserIds: getUserIds(reportApprovalSettings.approvalNotificationUsers),
  } : reportApprovalSettings

  const reportOpts = getOptionsFromApprovalSettings(reportApprovalSettings, 'report', reports)
  const qcUserOpts = getOptionsFromApprovalSettings(reportApprovalSettings, 'qcs', qcUsers)
  const approversOpts = getOptionsFromApprovalSettings(reportApprovalSettings, 'approvers', approverUsers)
  const notificationUserOpts = getOptionsFromApprovalSettings(
    reportApprovalSettings, 'approvalNotificationUsers', notificationUsers,
  )

  return (
    <ResourceFormModal
      resourceName="report_approval_settings"
      resource={reportApprovalSettingsFormData}
      readableResourceName="Report Approval Settings"
      showSuccessMessages
      close={close}
      scrollToFirstError
      modalProps={{ width: 620 }}
      storeManager={{ form }}
      request={{
        createResource: addReportApprovalSetting,
        updateResource: updateReportApprovalSetting,
      }}
      transformValues={(formValuesObj: FormValueObj) => {
        const stringToNumber = (value: string) => parseInt(value, 10)
        const { approvalNotificationUserIds, approverUserIds, qcUserIds } = formValuesObj

        return {
          ...formValuesObj,
          approvalNotificationUserIds: (approvalNotificationUserIds || []).map(stringToNumber),
          approverUserIds: (approverUserIds || []).map(stringToNumber),
          qcUserIds: qcUserIds.map(stringToNumber),
        }
      }}
    >
      {() => (
        <>
          <Form.Item
            name="reportId"
            label="Report"
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              onSearch={(value) => {
                fetchReports({
                  apiConfig: { filter: { name_cont: value } },
                })
              }}
              notFoundContent={isReportsLoading('fetch') ? <Spin size="small" /> : null}
              filterOption={false}
            >
              {reportOpts.map(({ id, name }) => (
                <Option key={id} value={id}>
                  {name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Collapse
            className="mb24"
            items={[{
              key: '1',
              label: 'Settings',
              children: (
                <Space direction="vertical" size="middle">
                  <Space align="center">
                    <Form.Item
                      name="approversNotRequired"
                      valuePropName="checked"
                      noStyle
                    >
                      <Switch />
                    </Form.Item>
                    <div className="weight-600">
                      {I18n.t('administration.campaigns.assessment_reports.report_approval.approvers_not_required')}
                    </div>
                  </Space>
                  {!form.getFieldValue('approversNotRequired') && (
                    <>
                      <Space align="center">
                        <Form.Item
                          name="approversCanEdit"
                          valuePropName="checked"
                          noStyle
                        >
                          <Switch />
                        </Form.Item>
                        <div className="weight-600">
                          {I18n.t('administration.campaigns.assessment_reports.report_approval.approvers_can_edit')}
                        </div>
                      </Space>
                    </>
                  )}
                  <Space align="center">
                    <Form.Item
                      name="doNotSendNotifications"
                      valuePropName="checked"
                      noStyle
                    >
                      <Switch />
                    </Form.Item>
                    <div className="weight-600">
                      {I18n.t('administration.campaigns.assessment_reports.report_approval.do_not_send_notifications')}
                    </div>
                  </Space>
                </Space>),
            }]}
          />

          <Form.Item
            name="qcUserIds"
            label="QC Users"
            rules={[{ required: true }]}
          >
            <Select
              mode="multiple"
              showSearch
              onSearch={(value) => {
                fetchQcUsers({
                  apiConfig: { filter: { with_access_to_campaign: campaignId, search_query: value } },
                })
              }}
              notFoundContent={isQcUsersLoading('fetch') ? <Spin size="small" /> : null}
              filterOption={false}
            >
              {qcUserOpts.map(({ id, name, email }) => (
                <Option key={id} value={id}>
                  {name}
                  {' '}
                  (
                  {email}
                  )
                </Option>
              ))}
            </Select>
          </Form.Item>

          {!form.getFieldValue('approversNotRequired') && (
            <Form.Item
              name="approverUserIds"
              label="Approvers"
              rules={[{ required: true }]}
            >
              <Select
                mode="multiple"
                showSearch
                onSearch={(value) => {
                  fetchApproverUsers({
                    apiConfig: { filter: { with_access_to_campaign: campaignId, search_query: value } },
                  })
                }}
                notFoundContent={isApproverUsersLoading('fetch') ? <Spin size="small" /> : null}
                filterOption={false}
              >
                {approversOpts.map(({ id, name, email }) => (
                  <Option key={`approvers_${id}`} value={id}>
                    {name}
                    {' '}
                    (
                    {email}
                    )
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
          {!form.getFieldValue('doNotSendNotifications') && (
            <Form.Item
              name="approvalNotificationUserIds"
              label="Approval Notification Users"
              rules={[{ required: true }]}
            >
              <Select
                mode="multiple"
                showSearch
                onSearch={(value) => {
                  fetchNotificationUsers({
                    apiConfig: { filter: { with_access_to_campaign: campaignId, search_query: value } },
                  })
                }}
                notFoundContent={isNotificationUsersLoading('fetch') ? <Spin size="small" /> : null}
                filterOption={false}
              >
                {notificationUserOpts.map(({ id, name, email }) => (
                  <Option key={`notiification_user_${id}`} value={id}>
                    {name}
                    {' '}
                    (
                    {email}
                    )
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

        </>
      )}
    </ResourceFormModal>
  )
}
