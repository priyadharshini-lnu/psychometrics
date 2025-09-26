import {
  Collapse,
  Form, Select, Space, Spin, Switch,
  TimePicker,
} from 'antd'
import _ from 'lodash'
import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from 'modules/admin/core/rootReducers'
import { Report, ReportTR } from '~/modules/admin/modules/campaigns/core/reportList'
import { User, UserTR } from '~/modules/admin/modules/campaigns/core/user'
import { CreateResource, UpdateResource } from '~/hooks/useResources/interfaces'
import ResourceFormModal from '~/components/ResourceFormModal'
import { useResources } from '~/hooks/useResources'
import { AdditionRelationshipAttribute } from '~/libs/jsonApi/interfaces'
import { ReportApprovalSettings } from '~/modules/admin/modules/campaigns/core/reportApprovalSettings'
import TimeZoneSelect from '~/components/TimeZoneSelect'
import dayjs from '~/utils/dayjs'
import { getFeatures } from '~/core/config'

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
  approversNotRequired: boolean,
  approversCanEdit: boolean,
  doNotSendNotifications: boolean,
  sendDigestEmails: boolean,
  digestDeliveryMode: string,
  digestFrequency: string,
  digestWeekdays: number[],
  digestTime:string,
  digestTimezone: string,
}

const getOptionsFromApprovalSettings = (reportApprovalSettings, dataKey, fetchedData) => (
  reportApprovalSettings?.[dataKey]
    ? _.uniqBy(fetchedData.concat(reportApprovalSettings[dataKey]), ({ id }: { id: string}) => id.toString())
    : fetchedData
)

const getUserIds = users => users.map(user => user.id)

const showDigestToggle = (form) => {
  const allowBulk = form.getFieldValue('allowQcBulkSubmit') || form.getFieldValue('allowBulkApprove')
  const noNotifications = !form.getFieldValue('doNotSendNotifications')
  return allowBulk && noNotifications
}

const showDigestOptions = form => showDigestToggle(form) && form.getFieldValue('sendDigestEmails')

const showDigestSchedulingOptions = form => showDigestOptions(form)
                                            && form.getFieldValue('digestDeliveryMode') === 'scheduled'

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
    digestTime: reportApprovalSettings.digestTime ? dayjs(reportApprovalSettings.digestTime, 'hh:mm A') : null,
  } : reportApprovalSettings

  const reportOpts = getOptionsFromApprovalSettings(reportApprovalSettings, 'report', reports)
  const qcUserOpts = getOptionsFromApprovalSettings(reportApprovalSettings, 'qcs', qcUsers)
  const approversOpts = getOptionsFromApprovalSettings(reportApprovalSettings, 'approvers', approverUsers)
  const notificationUserOpts = getOptionsFromApprovalSettings(
    reportApprovalSettings, 'approvalNotificationUsers', notificationUsers,
  )

  const fetchReportDebounce = useCallback(_.debounce((value) => {
    fetchReports({
      apiConfig: { filter: { name_cont: value } },
    })
  }, 300), [])

  const fetchQcDebounce = useCallback(_.debounce((value) => {
    fetchQcUsers({
      apiConfig: { filter: { with_access_to_campaign: campaignId, search_query: value } },
    })
  }, 300), [])

  const fetchApproverDebounce = useCallback(_.debounce((value) => {
    fetchApproverUsers({
      apiConfig: { filter: { with_access_to_campaign: campaignId, search_query: value } },
    })
  }, 300), [])

  const fetchNotificationDebounce = useCallback(_.debounce((value) => {
    fetchNotificationUsers({
      apiConfig: { filter: { with_access_to_campaign: campaignId, search_query: value } },
    })
  }, 300), [])

  const features = useSelector((state: RootState) => getFeatures(state))
  const isDigestEmailsEnabled = features?.digest_emails_enabled

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
          approversNotRequired: formValuesObj.approversNotRequired || false,
          approversCanEdit: formValuesObj.approversCanEdit || false,
          doNotSendNotifications: formValuesObj.doNotSendNotifications || false,
          sendDigestEmails: formValuesObj.doNotSendNotifications ? false : formValuesObj.sendDigestEmails || false,
          digestDeliveryMode: formValuesObj.sendDigestEmails ? formValuesObj.digestDeliveryMode : null,
          digestFrequency: formValuesObj.sendDigestEmails ? formValuesObj.digestFrequency : null,
          digestWeekdays: formValuesObj.sendDigestEmails && formValuesObj.digestFrequency !== 'daily'
            ? formValuesObj.digestWeekdays : [],
          digestTime: formValuesObj.sendDigestEmails ? dayjs(formValuesObj.digestTime).format('HH:mm:ss') : null,
        }
      }}
    >
      {() => (
        <>
          <Form.Item
            name="reportId"
            label={I18n.t('administration.campaigns.assessment_reports.report_approval.report')}
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              disabled={!!reportApprovalSettings}
              onSearch={fetchReportDebounce}
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
              label: I18n.t('administration.campaigns.assessment_reports.report_approval.settings'),
              children: (
                <Space direction="vertical" size="middle">
                  <Space align="center">
                    <Form.Item
                      name="approversNotRequired"
                      valuePropName="checked"
                      noStyle
                    >
                      <Switch disabled={form.getFieldValue('approverUserIds')?.length > 0} />
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
                      <Switch disabled={form.getFieldValue('approvalNotificationUserIds')?.length > 0} />
                    </Form.Item>
                    <div className="weight-600">
                      {I18n.t('administration.campaigns.assessment_reports.report_approval.do_not_send_notifications')}
                    </div>
                  </Space>
                  <Space align="center">
                    <Form.Item
                      name="allowQcBulkSubmit"
                      valuePropName="checked"
                      noStyle
                    >
                      <Switch />
                    </Form.Item>
                    <div className="weight-600">
                      {I18n.t('administration.campaigns.assessment_reports.report_approval.allow_qc_bulk_submit')}
                    </div>
                  </Space>
                  <Space align="center">
                    <Form.Item
                      name="allowBulkApprove"
                      valuePropName="checked"
                      noStyle
                    >
                      <Switch />
                    </Form.Item>
                    <div className="weight-600">
                      {I18n.t('administration.campaigns.assessment_reports.report_approval.allow_bulk_approve')}
                    </div>
                  </Space>

                  {isDigestEmailsEnabled && showDigestToggle(form) && (
                    <Space align="center">
                      <Form.Item
                        name="sendDigestEmails"
                        valuePropName="checked"
                        noStyle
                      >
                        <Switch />
                      </Form.Item>
                      <div className="weight-600">
                        {I18n.t('administration.campaigns.assessment_reports.report_approval.send_digest_emails')}
                      </div>
                    </Space>
                  )}

                  {isDigestEmailsEnabled && showDigestOptions(form) && (
                    <Form.Item
                      name="digestDeliveryMode"
                      label={I18n.t(
                        'administration.campaigns.assessment_reports.report_approval.digest_delivery_mode.form_label',
                      )}
                      rules={[{ required: form.getFieldValue('sendDigestEmails') }]}
                    >
                      <Select>
                        <Option value="immediate">
                          {I18n.t(
                            'administration.campaigns.assessment_reports'
                            + '.report_approval.digest_delivery_mode.immediate',
                          )}
                        </Option>
                        <Option value="scheduled">
                          {I18n.t(
                            'administration.campaigns.assessment_reports'
                            + '.report_approval.digest_delivery_mode.scheduled',
                          )}
                        </Option>
                      </Select>
                    </Form.Item>
                  )}
                  {isDigestEmailsEnabled && showDigestSchedulingOptions(form) && (
                    <>
                      <Form.Item
                        name="digestFrequency"
                        label={I18n.t(
                          'administration.campaigns.assessment_reports.report_approval.digest_frequency.form_label',
                        )}
                        rules={[{ required: form.getFieldValue('sendDigestEmails') }]}
                      >
                        <Select>
                          <Option value="daily">
                            {I18n.t(
                              'administration.campaigns.assessment_reports.report_approval.digest_frequency.daily',
                            )}
                          </Option>
                          <Option value="weekly">
                            {I18n.t(
                              'administration.campaigns.assessment_reports.report_approval.digest_frequency.weekly',
                            )}
                          </Option>
                          <Option value="weekdays">
                            {I18n.t(
                              'administration.campaigns.assessment_reports.report_approval.digest_frequency.weekdays',
                            )}
                          </Option>
                        </Select>
                      </Form.Item>
                      {['weekly', 'weekdays'].includes(form.getFieldValue('digestFrequency')) && (
                        <Form.Item
                          name="digestWeekdays"
                          label={I18n.t(
                            'administration.campaigns.assessment_reports.report_approval.digest_weekdays.form_label',
                          )}
                          rules={[{
                            required: form.getFieldValue('sendDigestEmails')
                          && ['weekly', 'weekdays'].includes(form.getFieldValue('digestFrequency')),
                          }]}
                        >
                          <Select
                            mode="multiple"
                            maxCount={form.getFieldValue('digestFrequency') === 'weekly' ? 1 : 7}
                          >
                            <Option value={0}>
                              {I18n.t(
                                'administration.campaigns.assessment_reports.report_approval.digest_weekdays.sunday',
                              )}
                            </Option>
                            <Option value={1}>
                              {I18n.t(
                                'administration.campaigns.assessment_reports.report_approval.digest_weekdays.monday',
                              )}
                            </Option>
                            <Option value={2}>
                              {I18n.t(
                                'administration.campaigns.assessment_reports.report_approval.digest_weekdays.tuesday',
                              )}
                            </Option>
                            <Option value={3}>
                              {I18n.t(
                                'administration.campaigns.assessment_reports.report_approval.digest_weekdays.wednesday',
                              )}
                            </Option>
                            <Option value={4}>
                              {I18n.t(
                                'administration.campaigns.assessment_reports.report_approval.digest_weekdays.thursday',
                              )}
                            </Option>
                            <Option value={5}>
                              {I18n.t(
                                'administration.campaigns.assessment_reports.report_approval.digest_weekdays.friday',
                              )}
                            </Option>
                            <Option value={6}>
                              {I18n.t(
                                'administration.campaigns.assessment_reports.report_approval.digest_weekdays.saturday',
                              )}
                            </Option>
                          </Select>
                        </Form.Item>
                      )}
                      <Form.Item
                        name="digestTime"
                        label={I18n.t('administration.campaigns.assessment_reports.report_approval.digest_time')}
                        rules={[{ required: form.getFieldValue('sendDigestEmails') }]}
                      >
                        <TimePicker format="hh:mm A" use12Hours />
                      </Form.Item>
                      <Form.Item
                        name="digestTimezone"
                        label={I18n.t('administration.campaigns.assessment_reports.report_approval.digest_timezone')}
                        rules={[{ required: form.getFieldValue('sendDigestEmails') }]}
                      >
                        <TimeZoneSelect value="" onChange={() => {}} />

                      </Form.Item>
                    </>
                  )}

                </Space>),
            }]}
          />

          <Form.Item
            name="qcUserIds"
            label={I18n.t('administration.campaigns.assessment_reports.report_approval.qc_users')}
            rules={[{ required: true }]}
          >
            <Select
              mode="multiple"
              showSearch
              onSearch={fetchQcDebounce}
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
              label={I18n.t('administration.campaigns.assessment_reports.report_approval.approvers')}
              rules={[{ required: true }]}
            >
              <Select
                mode="multiple"
                showSearch
                onSearch={fetchApproverDebounce}
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
              label={I18n.t('administration.campaigns.assessment_reports.report_approval.approval_notification_users')}
              rules={[{ required: true }]}
            >
              <Select
                mode="multiple"
                showSearch
                onSearch={fetchNotificationDebounce}
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
