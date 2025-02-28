import {
  Collapse,
  Form, Select, Space, Spin, Switch,
} from 'antd'
import _ from 'lodash'
import { User, UserTR } from '~/modules/admin/modules/campaigns/core/user'
import { CreateResource, UpdateResource } from '~/hooks/useResources/interfaces'
import ResourceFormModal from '~/components/ResourceFormModal'
import { useResources } from '~/hooks/useResources'
import { AdditionRelationshipAttribute } from '~/libs/jsonApi/interfaces'
import { ReportApprovalSettings } from '~/modules/admin/modules/campaigns/core/reportApprovalSettings'

const { Option } = Select

interface Props {
  reportApprovalSettings: AdditionRelationshipAttribute<ReportApprovalSettings>
  addReportApprovalSetting: CreateResource<ReportApprovalSettings>
  updateReportApprovalSetting: UpdateResource<ReportApprovalSettings>
  campaignId: string
  reportId: number
  close(): void
}

type FormValueObj = {
  approvalNotificationUserIds: string[],
  approverUserIds: string[],
  qcUserIds: string[],
  reportId: string,
  approversNotRequired: boolean,
  approversCanEdit: boolean,
  doNotSendNotifications: boolean,
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
  reportId,
  close,
}) => {
  const [form] = Form.useForm()
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
          approversNotRequired: formValuesObj.approversNotRequired || false,
          approversCanEdit: formValuesObj.approversCanEdit || false,
          doNotSendNotifications: formValuesObj.doNotSendNotifications || false,
          approvalNotificationUserIds: (approvalNotificationUserIds || []).map(stringToNumber),
          approverUserIds: (approverUserIds || []).map(stringToNumber),
          qcUserIds: qcUserIds.map(stringToNumber),
          reportId,
        }
      }}
    >
      {() => (
        <>
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
                      Approvers Not Required
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
                          Approvers Can Edit
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
                      Do Not Send Notifications
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
                  apiConfig: {
                    filter: { with_access_to_campaign: campaignId, search_query: value },
                    query: { is_threesixty: true },
                  },
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
