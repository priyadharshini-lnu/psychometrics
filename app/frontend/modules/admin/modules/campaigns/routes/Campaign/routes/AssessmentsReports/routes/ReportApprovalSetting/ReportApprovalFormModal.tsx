import {
  Collapse,
  Form, Select, Space, Spin, Switch,
  TimePicker,
} from 'antd'
import _ from 'lodash'
import { useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from 'modules/admin/core/rootReducers'
import { Report, ReportTR } from '~/modules/admin/modules/campaigns/core/reportList'
import { User, UserTR } from '~/modules/admin/modules/campaigns/core/user'
import { CreateResource, UpdateResource } from '~/hooks/useResources/interfaces'
import ResourceFormModal from '~/components/ResourceFormModal'
import { useResources } from '~/hooks/useResources'
import { normalizeTimeZone } from '~/hooks/useTimezones'
import { AdditionRelationshipAttribute } from '~/libs/jsonApi/interfaces'
import { ReportApprovalSettings } from '~/modules/admin/modules/campaigns/core/reportApprovalSettings'
import TimeZoneSelect from '~/components/TimeZoneSelect'
import dayjs from '~/utils/dayjs'
import { getFeatures } from '~/core/config'
import { camelizeKeys } from '~/utils/object'

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


export const ReportApprovalFormModal: React.FC<Props> = ({
  reportApprovalSettings,
  addReportApprovalSetting,
  updateReportApprovalSetting,
  campaignId,
  close,
}) => {
  const [form] = Form.useForm()
  const browserTimeZone = normalizeTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone)
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
    digestTimezone: reportApprovalSettings.digestTimezone || browserTimeZone,
  } : reportApprovalSettings

  const reportOpts = getOptionsFromApprovalSettings(reportApprovalSettings, 'report', reports)
  const qcUserOpts = getOptionsFromApprovalSettings(reportApprovalSettings, 'qcs', qcUsers)
  const approversOpts = getOptionsFromApprovalSettings(reportApprovalSettings, 'approvers', approverUsers)
  const notificationUserOpts = getOptionsFromApprovalSettings(
    reportApprovalSettings, 'approvalNotificationUsers', notificationUsers,
  )

  useEffect(() => {
    fetchReports({
      apiConfig: { filter: { with_campaign: campaignId } },
    })
  }, [])

  const fetchReportDebounce = useCallback(_.debounce((value) => {
    fetchReports({
      apiConfig: { filter: { with_campaign: campaignId, name_cont: value } },
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
  const isDigestEmailsEnabled = camelizeKeys(features)?.digestEmailsEnabled ?? false

  const allowQcBulkSubmit = Form.useWatch('allowQcBulkSubmit', form)
                            ?? reportApprovalSettingsFormData?.allowQcBulkSubmit ?? false
  const allowBulkApprove = Form.useWatch('allowBulkApprove', form)
                            ?? reportApprovalSettingsFormData?.allowBulkApprove ?? false
  const doNotSendNotifications = Form.useWatch('doNotSendNotifications', form)
                            ?? reportApprovalSettingsFormData?.doNotSendNotifications ?? false
  const sendDigestEmails = Form.useWatch('sendDigestEmails', form)
                            ?? reportApprovalSettingsFormData?.sendDigestEmails ?? false
  const digestDeliveryMode = Form.useWatch('digestDeliveryMode', form)
                            ?? reportApprovalSettingsFormData?.digestDeliveryMode
  const digestFrequency = Form.useWatch('digestFrequency', form)
                            ?? reportApprovalSettingsFormData?.digestFrequency


  const showDigestToggle = (allowQcBulkSubmit || allowBulkApprove) && !doNotSendNotifications
  const showDigestOptions = showDigestToggle && sendDigestEmails
  const showDigestSchedulingOptions = showDigestOptions && digestDeliveryMode === 'scheduled'

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
          digestTimezone: formValuesObj.sendDigestEmails
            ? formValuesObj.digestTimezone || browserTimeZone : null,
        }
      }}
    >
      {() => (
        <>
          <Form.Item
            name="reportId"
            label={I18n.t('admin.report_approval_report')}
            rules={[{ required: true }]}
          >
            <Select
              showSearch={{ filterOption: false, onSearch: fetchReportDebounce }}
              disabled={!!reportApprovalSettings}
              notFoundContent={isReportsLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
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
              label: I18n.t('admin.report_approval_settings'),
              children: (
                <Space orientation="vertical" size="middle">
                  <Space align="center">
                    <Form.Item
                      name="approversNotRequired"
                      valuePropName="checked"
                      noStyle
                    >
                      <Switch disabled={form.getFieldValue('approverUserIds')?.length > 0} />
                    </Form.Item>
                    <div className="weight-600">
                      {I18n.t('admin.report_approval_approvers_not_required')}
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
                          {I18n.t('admin.report_approval_approvers_can_edit')}
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
                      {I18n.t('admin.report_approval_do_not_send_notifications')}
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
                      {I18n.t('admin.report_approval_allow_qc_bulk_submit')}
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
                      {I18n.t('admin.report_approval_allow_bulk_approve')}
                    </div>
                  </Space>

                  {isDigestEmailsEnabled && showDigestToggle && (
                    <Space align="center">
                      <Form.Item
                        name="sendDigestEmails"
                        valuePropName="checked"
                        noStyle
                      >
                        <Switch />
                      </Form.Item>
                      <div className="weight-600">
                        {I18n.t('admin.report_approval_send_digest_emails')}
                      </div>
                    </Space>
                  )}

                  {isDigestEmailsEnabled && showDigestOptions && (
                    <Form.Item
                      name="digestDeliveryMode"
                      label={I18n.t(
                        'admin.report_approval_digest_delivery_mode_form_label',
                      )}
                      rules={[{ required: sendDigestEmails }]}
                    >
                      <Select>
                        <Option value="immediate">
                          {I18n.t(
                            'admin.report_approval_digest_delivery_mode_immediate',
                          )}
                        </Option>
                        <Option value="scheduled">
                          {I18n.t(
                            'admin.report_approval_digest_delivery_mode_scheduled',
                          )}
                        </Option>
                      </Select>
                    </Form.Item>
                  )}
                  {isDigestEmailsEnabled && showDigestSchedulingOptions && (
                    <>
                      <Form.Item
                        name="digestFrequency"
                        label={I18n.t(
                          'admin.report_approval_digest_frequency_form_label',
                        )}
                        rules={[{ required: sendDigestEmails }]}
                      >
                        <Select>
                          <Option value="daily">
                            {I18n.t(
                              'admin.report_approval_digest_frequency_daily',
                            )}
                          </Option>
                          <Option value="weekly">
                            {I18n.t(
                              'admin.report_approval_digest_frequency_weekly',
                            )}
                          </Option>
                          <Option value="weekdays">
                            {I18n.t(
                              'admin.report_approval_digest_frequency_weekdays',
                            )}
                          </Option>
                        </Select>
                      </Form.Item>
                      {['weekly', 'weekdays'].includes(digestFrequency) && (
                        <Form.Item
                          name="digestWeekdays"
                          label={I18n.t(
                            'admin.report_approval_digest_weekdays_form_label',
                          )}
                          rules={[{
                            required: sendDigestEmails
                          && ['weekly', 'weekdays'].includes(digestFrequency),
                          }]}
                        >
                          <Select
                            mode="multiple"
                            maxCount={digestFrequency === 'weekly' ? 1 : 7}
                          >
                            <Option value={0}>
                              {I18n.t(
                                'admin.report_approval_digest_weekdays_sunday',
                              )}
                            </Option>
                            <Option value={1}>
                              {I18n.t(
                                'admin.report_approval_digest_weekdays_monday',
                              )}
                            </Option>
                            <Option value={2}>
                              {I18n.t(
                                'admin.report_approval_digest_weekdays_tuesday',
                              )}
                            </Option>
                            <Option value={3}>
                              {I18n.t(
                                'admin.report_approval_digest_weekdays_wednesday',
                              )}
                            </Option>
                            <Option value={4}>
                              {I18n.t(
                                'admin.report_approval_digest_weekdays_thursday',
                              )}
                            </Option>
                            <Option value={5}>
                              {I18n.t(
                                'admin.report_approval_digest_weekdays_friday',
                              )}
                            </Option>
                            <Option value={6}>
                              {I18n.t(
                                'admin.report_approval_digest_weekdays_saturday',
                              )}
                            </Option>
                          </Select>
                        </Form.Item>
                      )}
                      <Form.Item
                        name="digestTime"
                        label={I18n.t('admin.report_approval_digest_time')}
                        rules={[{ required: sendDigestEmails }]}
                      >
                        <TimePicker format="hh:mm A" use12Hours />
                      </Form.Item>
                      <Form.Item
                        name="digestTimezone"
                        label={I18n.t('admin.report_approval_digest_timezone')}
                        rules={[{
                          required: sendDigestEmails && digestDeliveryMode === 'scheduled',
                        }]}
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
            label={I18n.t('admin.report_approval_qc_users')}
            rules={[{ required: true }]}
          >
            <Select
              mode="multiple"
              showSearch={{ filterOption: false, onSearch: fetchQcDebounce }}
              notFoundContent={isQcUsersLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
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
              label={I18n.t('admin.report_approval_approvers')}
              rules={[{ required: true }]}
            >
              <Select
                mode="multiple"
                showSearch={{ filterOption: false, onSearch: fetchApproverDebounce }}
                notFoundContent={
                  isApproverUsersLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')
                }
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
              label={I18n.t('admin.report_approval_notification_users')}
              rules={[{ required: true }]}
            >
              <Select
                mode="multiple"
                showSearch={{ filterOption: false, onSearch: fetchNotificationDebounce }}
                notFoundContent={
                  isNotificationUsersLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')
                }
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
