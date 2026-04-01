import {
  Collapse,
  Form, Select, Space, Spin, Switch,
  TimePicker,
} from 'antd'
import _ from 'lodash'
import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from 'modules/admin/core/rootReducers'
import { Assessment, AssessmentTR } from '~/modules/admin/modules/campaigns/core/assessmentList'
import { User, UserTR } from '~/modules/admin/modules/campaigns/core/user'
import { CreateResource, UpdateResource } from '~/hooks/useResources/interfaces'
import ResourceFormModal from '~/components/ResourceFormModal'
import { useResources } from '~/hooks/useResources'
import { AdditionRelationshipAttribute } from '~/libs/jsonApi/interfaces'
import { ScoringApprovalSettings } from '~/modules/admin/modules/campaigns/core/scoringApprovalSettings'
import TimeZoneSelect from '~/components/TimeZoneSelect'
import dayjs from '~/utils/dayjs'
import { getFeatures } from '~/core/config'
import { camelizeKeys } from '~/utils/object'

const { Option } = Select
const { I18n } = window

interface Props {
  scoringApprovalSettings: AdditionRelationshipAttribute<ScoringApprovalSettings>
  addScoringApprovalSetting: CreateResource<ScoringApprovalSettings>
  updateScoringApprovalSetting: UpdateResource<ScoringApprovalSettings>
  campaignId: string
  close(): void
}

type FormValueObj = {
  assessorIds: string[],
  approverIds: string[],
  assessmentId: string,
  allowOneLevelApprove: boolean,
  allowBulkApprove: boolean,
  allowBulkApproveScores: boolean,
  sendDigestEmails: boolean,
  digestDeliveryMode: string,
  digestFrequency: string,
  digestWeekdays: number[],
  digestTime:string,
  digestTimezone: string,
}

const getOptionsFromApprovalSettings = (scoringApprovalSettings, dataKey, fetchedData) => (
  scoringApprovalSettings?.[dataKey]
    ? _.uniqBy(fetchedData.concat(scoringApprovalSettings[dataKey]), ({ id }: { id: string}) => id.toString())
    : fetchedData
)

const getUserIds = users => users.map(user => user.id)


export const ScoringApprovalFormModal: React.FC<Props> = ({
  scoringApprovalSettings,
  addScoringApprovalSetting,
  updateScoringApprovalSetting,
  campaignId,
  close,
}) => {
  const [form] = Form.useForm()
  const {
    data: assessments, fetch: fetchAssessments, isLoading: isAssessmentsLoading,
  } = useResources<Assessment>('assessments', { responseType: AssessmentTR })
  const {
    data: assessorUsers, fetch: fetchAssessorUsers, isLoading: isAssessorUsersLoading,
  } = useResources<User>('users', { responseType: UserTR })
  const {
    data: approverUsers, fetch: fetchApproverUsers, isLoading: isApproverUsersLoading,
  } = useResources<User>('users', { responseType: UserTR })

  const scoringApprovalSettingsFormData = scoringApprovalSettings ? {
    ...scoringApprovalSettings,
    assessorIds: getUserIds(scoringApprovalSettings.assessors),
    approverIds: getUserIds(scoringApprovalSettings.approvers),
    digestTime: scoringApprovalSettings.digestTime ? dayjs(scoringApprovalSettings.digestTime, 'hh:mm A') : null,
    digestTimezone: scoringApprovalSettings.digestTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
  } : scoringApprovalSettings

  const assessmentOpts = getOptionsFromApprovalSettings(scoringApprovalSettings, 'assessment', assessments)
  const assessorOpts = getOptionsFromApprovalSettings(scoringApprovalSettings, 'assessors', assessorUsers)
  const approversOpts = getOptionsFromApprovalSettings(scoringApprovalSettings, 'approvers', approverUsers)

  const fetchAssessmentDebounce = useCallback(_.debounce((value) => {
    fetchAssessments({
      apiConfig: { filter: { name_cont: value, with_ai_questions: 'true' } },
    })
  }, 300), [])

  const fetchAssessorDebounce = useCallback(_.debounce((value) => {
    fetchAssessorUsers({
      apiConfig: { filter: { with_access_to_campaign: campaignId, search_query: value } },
    })
  }, 300), [])

  const fetchApproverDebounce = useCallback(_.debounce((value) => {
    fetchApproverUsers({
      apiConfig: { filter: { with_access_to_campaign: campaignId, search_query: value } },
    })
  }, 300), [])

  const features = useSelector((state: RootState) => getFeatures(state))
  const isDigestEmailsEnabled = camelizeKeys(features)?.digestEmailsEnabled ?? false

  const allowBulkApprove = Form.useWatch('allowBulkApprove', form)
                            ?? scoringApprovalSettingsFormData?.allowBulkApprove ?? false
  const allowOneLevelApprove = Form.useWatch('allowOneLevelApprove', form)
                            ?? scoringApprovalSettingsFormData?.allowOneLevelApprove ?? false
  const sendDigestEmails = Form.useWatch('sendDigestEmails', form)
                            ?? scoringApprovalSettingsFormData?.sendDigestEmails ?? false
  const digestDeliveryMode = Form.useWatch('digestDeliveryMode', form)
                            ?? scoringApprovalSettingsFormData?.digestDeliveryMode
  const digestFrequency = Form.useWatch('digestFrequency', form)
                            ?? scoringApprovalSettingsFormData?.digestFrequency


  const showDigestToggle = allowBulkApprove
  const showDigestOptions = showDigestToggle && sendDigestEmails
  const showDigestSchedulingOptions = showDigestOptions && digestDeliveryMode === 'scheduled'

  return (
    <ResourceFormModal
      resourceName="ai_scoring_approval_settings"
      resource={scoringApprovalSettingsFormData}
      readableResourceName="AI Scoring Approval Settings"
      showSuccessMessages
      close={close}
      scrollToFirstError
      modalProps={{ width: 620 }}
      storeManager={{ form }}
      request={{
        createResource: addScoringApprovalSetting,
        updateResource: updateScoringApprovalSetting,
      }}
      transformValues={(formValuesObj: FormValueObj) => {
        const stringToNumber = (value: string) => parseInt(value, 10)
        const { approverIds, assessorIds } = formValuesObj

        return {
          ...formValuesObj,
          assessorIds: (assessorIds || []).map(stringToNumber),
          approverIds: (approverIds || []).map(stringToNumber),
          sendDigestEmails: formValuesObj.sendDigestEmails || false,
          allowOneLevelApprove: formValuesObj.allowOneLevelApprove || false,
          allowBulkApprove: formValuesObj.allowBulkApprove || false,
          allowBulkApproveScores: formValuesObj.allowBulkApproveScores || false,
          digestDeliveryMode: formValuesObj.sendDigestEmails ? formValuesObj.digestDeliveryMode : null,
          digestFrequency: formValuesObj.sendDigestEmails ? formValuesObj.digestFrequency : null,
          digestWeekdays: formValuesObj.sendDigestEmails && formValuesObj.digestFrequency !== 'daily'
            ? formValuesObj.digestWeekdays : [],
          digestTime: formValuesObj.sendDigestEmails ? dayjs(formValuesObj.digestTime).format('HH:mm:ss') : null,
          digestTimezone: formValuesObj.sendDigestEmails
            ? formValuesObj.digestTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone : null,
        }
      }}
    >
      {() => (
        <>
          <Form.Item
            name="assessmentId"
            label={I18n.t('admin.scoring_approval_assessment')}
            rules={[{ required: true }]}
          >
            <Select
              showSearch={{ filterOption: false, onSearch: fetchAssessmentDebounce }}
              disabled={!!scoringApprovalSettings}
              notFoundContent={
                isAssessmentsLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')
              }
            >
              {assessmentOpts.map(({ id, name }) => (
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
                      name="allowOneLevelApprove"
                      valuePropName="checked"
                      noStyle
                    >
                      <Switch />
                    </Form.Item>
                    <div className="weight-600">
                      {I18n.t('admin.scoring_approval_allow_one_level_approve')}
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
                      {I18n.t('admin.scoring_approval_allow_bulk_approve')}
                    </div>
                  </Space>
                  <Space align="center">
                    <Form.Item
                      name="allowBulkApproveScores"
                      valuePropName="checked"
                      noStyle
                    >
                      <Switch />
                    </Form.Item>
                    <div className="weight-600">
                      {I18n.t('admin.scoring_approval_allow_bulk_approve_scores')}
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
                        {I18n.t('administration.campaigns.assessment_reports.report_approval.send_digest_emails')}
                      </div>
                    </Space>
                  )}

                  {isDigestEmailsEnabled && showDigestOptions && (
                    <Form.Item
                      name="digestDeliveryMode"
                      label={I18n.t('admin.digest_delivery_mode.form_label')}
                      rules={[{ required: sendDigestEmails }]}
                    >
                      <Select
                        options={[
                          {
                            label: I18n.t('admin.digest_delivery_mode.immediate'),
                            value: 'immediate',
                          },
                          {
                            label: I18n.t('admin.digest_delivery_mode.scheduled'),
                            value: 'scheduled',
                          },
                        ]}
                      />
                    </Form.Item>
                  )}
                  {isDigestEmailsEnabled && showDigestSchedulingOptions && (
                    <>
                      <Form.Item
                        name="digestFrequency"
                        label={I18n.t('admin.digest_frequency.form_label')}
                        rules={[{ required: sendDigestEmails }]}
                      >
                        <Select options={[
                          {
                            label: I18n.t('admin.digest_frequency.daily'),
                            value: 'daily',
                          },
                          {
                            label: I18n.t('admin.digest_frequency.weekly'),
                            value: 'weekly',
                          },
                          {
                            label: I18n.t('admin.digest_frequency.weekdays'),
                            value: 'weekdays',
                          },
                        ]}
                        />
                      </Form.Item>
                      {['weekly', 'weekdays'].includes(digestFrequency) && (
                        <Form.Item
                          name="digestWeekdays"
                          label={I18n.t('admin.digest_weekdays.form_label')}
                          rules={[{
                            required: sendDigestEmails
                          && ['weekly', 'weekdays'].includes(digestFrequency),
                          }]}
                        >
                          <Select
                            mode="multiple"
                            maxCount={digestFrequency === 'weekly' ? 1 : 7}
                            options={[
                              { label: I18n.t('admin.digest_weekdays.sunday'), value: 0 },
                              { label: I18n.t('admin.digest_weekdays.monday'), value: 1 },
                              { label: I18n.t('admin.digest_weekdays.tuesday'), value: 2 },
                              { label: I18n.t('admin.digest_weekdays.wednesday'), value: 3 },
                              { label: I18n.t('admin.digest_weekdays.thursday'), value: 4 },
                              { label: I18n.t('admin.digest_weekdays.friday'), value: 5 },
                              { label: I18n.t('admin.digest_weekdays.saturday'), value: 6 },
                            ]}
                          />
                        </Form.Item>
                      )}
                      <Form.Item
                        name="digestTime"
                        label={I18n.t('administration.campaigns.assessment_reports.report_approval.digest_time')}
                        rules={[{ required: sendDigestEmails }]}
                      >
                        <TimePicker format="hh:mm A" use12Hours />
                      </Form.Item>
                      <Form.Item
                        name="digestTimezone"
                        label={I18n.t('administration.campaigns.assessment_reports.report_approval.digest_timezone')}
                      >
                        <TimeZoneSelect value="" onChange={() => {}} />
                      </Form.Item>
                    </>
                  )}

                </Space>),
            }]}
          />

          {!allowOneLevelApprove && (
            <Form.Item
              name="assessorIds"
              label={I18n.t('admin.scoring_approval_assessor_users')}
              rules={[{ required: true }]}
            >
              <Select
                mode="multiple"
                showSearch={{ filterOption: false, onSearch: fetchAssessorDebounce }}
                notFoundContent={
                  isAssessorUsersLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')
                }
              >
                {assessorOpts.map(({ id, name, email }) => (
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
          )}

          <Form.Item
            name="approverIds"
            label={I18n.t('admin.scoring_approval_approver_users')}
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
        </>
      )}
    </ResourceFormModal>
  )
}
