import React, { useEffect, useState } from 'react'
import {
  Form, Input, InputNumber, Select, Tag, Space, Spin,
} from 'antd'
import dayjs from 'dayjs'
import pickBy from 'lodash/pickBy'
import { Provider } from 'react-redux'
import { SearchOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import ResourceFormModal from '~/components/ResourceFormModal'
import EmailEditor from '~/components/EmailEditor'
import TimeZoneSelect from '~/components/TimeZoneSelect'
import Modals from '~/modules/admin/components/Modals'
import store from '~/modules/admin/store'
import { useResources } from '~/hooks/useResources'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { PipedTextModal } from '~/modules/admin/modules/CommunicationForm/PipedTextModal'
import '~/modules/admin/modules/CommunicationForm/pipedText'
import { User, UserTR } from '~/modules/admin/modules/campaigns/core/user'
import * as assessmentGroups from '~/modules/admin/modules/campaigns/core/assessmentGroups'
import { CampaignAssessment, CampaignAssessmentTR } from '~/modules/admin/modules/campaigns/core/campaignAssessment'
import { CommunicationTemplateTR, CommunicationTemplate } from './core/communicationTemplates'
import { CommunicationDelivery } from './core/communicationDeliveries'
import {
  TemplateScope, TRIGGER_TYPES, DELIVERY_RULES, REMINDER_DELIVERY_RULES, RECIPIENTS, DELIVERY_FREQUENCIES,
  INTERVAL_PERIODS, WEEKDAYS,
} from './constants'

const { I18n } = window

const IDP_KINDS = [
  'idp_template_assigned', 'idp_template_approved', 'idp_template_rejected', 'idp_deadline_missed',
  'development_action_deadline_missed',
]
const WORKSHOP_EVENT_KINDS = ['workshop_invite', 'workshop_booked', 'workshop_cancelled', 'workshop_upcoming_reminder']
const NO_DELIVERY_RULE_KINDS = [
  'workshop_invite_reminder', 'assessment_center_booking_summary', 'report_available', 'completion',
  'magic_link_email', ...IDP_KINDS, ...WORKSHOP_EVENT_KINDS,
]
const NO_RECIPIENTS_KINDS = ['report_available', 'magic_link_email', ...IDP_KINDS, ...WORKSHOP_EVENT_KINDS]
const PROJECT_DELIVERABLE_KINDS = ['magic_link_email', ...IDP_KINDS]

const recipientsDefaultFor = (template: CommunicationTemplate | null): string | undefined => {
  if (template?.kind === 'assessment_center_booking_summary') return 'selected'
  if (template && NO_RECIPIENTS_KINDS.includes(template.kind)) return undefined
  return template?.recipientsDefault || undefined
}

interface DeliveryFormValues extends Record<string, unknown> {
  triggerType?: string
  communicationTemplateId?: string
  deliveryAt?: string
  selectedUserIds?: string[]
  ccUserIds?: string[]
  selectedAssessmentIds?: string[]
}

const toAttributes = (ids: string[] | undefined, key: string) => (
  ids?.length ? ids.map(id => ({ [key]: id })) : undefined
)

const buildPayload = (values: DeliveryFormValues, scope: TemplateScope) => {
  const {
    triggerType, communicationTemplateId, deliveryAt, selectedUserIds, ccUserIds, selectedAssessmentIds, ...fields
  } = values

  return {
    ...pickBy({
      ...fields,
      deliveryAt: deliveryAt && dayjs(deliveryAt).toISOString(),
      communicationDeliveryUsersAttributes: toAttributes(selectedUserIds, 'userId'),
      communicationDeliveryCcUsersAttributes: toAttributes(ccUserIds, 'userId'),
      communicationDeliveryAssessmentsAttributes: toAttributes(selectedAssessmentIds, 'assessmentId'),
      campaign: scope.campaignId && { id: scope.campaignId },
      project: !scope.campaignId && scope.projectId && { id: scope.projectId },
    }, Boolean),
    triggerType,
    communicationTemplate: communicationTemplateId ? { id: communicationTemplateId } : null,
  }
}

interface Props {
  close(): void
  scope: TemplateScope
}

export const DeliveryForm: React.FC<Props> = ({ close, scope }) => {
  const { resource } = useResourceContext<CommunicationDelivery>()
  const [form] = Form.useForm()

  const triggerType = Form.useWatch('triggerType', form)
  const deliveryRule = Form.useWatch('deliveryRule', form)
  const recipients = Form.useWatch('recipients', form)
  const [selectedTemplate, setSelectedTemplate] = useState<CommunicationTemplate | null>(null)
  const [body, setBody] = useState<string>('')
  const [assessmentGroupOptions, setAssessmentGroupOptions] = useState<assessmentGroups.CampaignAssessmentGroup[]>([])

  const handleBodyChange = (value: string) => {
    setBody(value)
    form.setFieldValue('body', value)
  }

  const {
    fetch: fetchUsers,
    data: users,
    isLoading: isLoadingUsers,
  } = useResources<User>('users', {
    basePath: `campaigns/${scope.campaignId}`,
    responseType: UserTR,
  })

  const {
    fetch: fetchCcUsers,
    data: ccUsers,
    isLoading: isLoadingCcUsers,
  } = useResources<User>('users', {
    responseType: UserTR,
    apiConfig: {
      filter: { admins_for_campaign: scope.campaignId || '' },
    },
  })

  const {
    fetch: fetchCampaignAssessments,
    data: campaignAssessments,
    isLoading: isLoadingCampaignAssessments,
  } = useResources<CampaignAssessment>('campaign_assessments', {
    basePath: `campaigns/${scope.campaignId}`,
    responseType: CampaignAssessmentTR,
    apiConfig: {
      include: ['assessment'],
      fields: { assessments: ['name'] },
    },
  })

  const {
    fetch: fetchTemplates,
    data: allTemplates,
    isLoading: isLoadingTemplates,
  } = useResources<CommunicationTemplate>('communication_templates', {
    responseType: CommunicationTemplateTR,
    apiConfig: {
      filter: scope.campaignId
        ? { campaign_id_eq: scope.campaignId, level_eq: 'campaign', include_inherited: 'true' }
        : { project_id_eq: scope.projectId || '', level_eq: 'project', include_inherited: 'true' },
    },
  })

  // magic_link_email and the idp_*/development_action_deadline_missed kinds are the only project-deliverable
  // kinds today -- restrict the picker to them so a project-scoped delivery can't be created for a kind the
  // backend won't accept.
  const templates = scope.campaignId
    ? allTemplates
    : allTemplates.filter(t => PROJECT_DELIVERABLE_KINDS.includes(t.kind))

  useEffect(() => {
    fetchTemplates()
    if (scope.campaignId) fetchCampaignAssessments()
  }, [])

  const isReminderTemplate = selectedTemplate?.kind === 'reminder'
  const isWorkshopInviteReminder = selectedTemplate?.kind === 'workshop_invite_reminder'
  const isBookingSummary = selectedTemplate?.kind === 'assessment_center_booking_summary'
  const isReportAvailable = selectedTemplate?.kind === 'report_available'
  const isCompletion = selectedTemplate?.kind === 'completion'
  const isMagicLink = selectedTemplate?.kind === 'magic_link_email'
  const isIdpKind = selectedTemplate ? IDP_KINDS.includes(selectedTemplate.kind) : false
  const isWorkshopEventKind = selectedTemplate ? WORKSHOP_EVENT_KINDS.includes(selectedTemplate.kind) : false
  const hasNoDeliveryRule = selectedTemplate ? NO_DELIVERY_RULE_KINDS.includes(selectedTemplate.kind) : false
  const isSpecificDatetime = deliveryRule === 'specific_datetime'
  const isReminderRule = REMINDER_DELIVERY_RULES.includes(deliveryRule) || isWorkshopInviteReminder
  const isBookingSummarySchedule = triggerType === 'scheduled' && isBookingSummary
  const deliveryFrequency = Form.useWatch('deliveryFrequency', form)

  const availableDeliveryRules = isReminderTemplate
    ? REMINDER_DELIVERY_RULES
    : DELIVERY_RULES.filter(rule => !REMINDER_DELIVERY_RULES.includes(rule))

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId) || null
    setSelectedTemplate(template)
    form.setFieldValue('deliveryRule', undefined)
    form.setFieldValue('recipients', recipientsDefaultFor(template))
    const templateBody = template?.body || ''
    setBody(templateBody)
    form.setFieldValue('body', templateBody)

    const needsAssessmentGroupOptions = template?.kind === 'workshop_invite_reminder'
      || (template && WORKSHOP_EVENT_KINDS.includes(template.kind))
    if (needsAssessmentGroupOptions && assessmentGroupOptions.length === 0 && scope.campaignId) {
      const dispatchResult = store.dispatch(assessmentGroups.fetch(parseInt(scope.campaignId, 10))) as unknown as
        Promise<{ response: { groups: assessmentGroups.CampaignAssessmentGroup[] } }>
      dispatchResult.then(({ response }) => setAssessmentGroupOptions(response.groups))
    }
  }

  useEffect(() => {
    if (selectedTemplate) {
      form.setFieldValue('subject', selectedTemplate.subject || '')
    }
  }, [selectedTemplate])

  return (
    <Provider store={store}>
      <ResourceFormModal
        resourceName="communication_deliveries"
        readableResourceName={I18n.t('admin.communication_delivery')}
        showSuccessMessages
        close={close}
        storeManager={{ form }}
        scrollToFirstError
        modalProps={{ width: 800, maskClosable: false }}
        formProps={{ initialValues: { triggerType: 'manual' } }}
        transformValues={values => buildPayload(values as DeliveryFormValues, scope)}
        onSuccessfulSubmission={() => resource.fetch()}
        request={{ createResource: resource.createResource }}
      >
        {() => (
          <>
            <Form.Item
              name="communicationTemplateId"
              label={I18n.t('admin.communication_delivery_template_label')}
              rules={[{ required: true }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                loading={isLoadingTemplates('fetch')}
                options={templates.map(template => ({
                  value: template.id,
                  label: template.name,
                  level: template.level,
                  kind: template.kind,
                }))}
                optionRender={option => (
                  <Space>
                    {option.data.label}
                    <Tag>
                      {I18n.t(`administration.communications.form.${option.data.kind}`)}
                    </Tag>
                    <Tag color={option.data.level === 'campaign' ? 'blue' : undefined}>
                      {I18n.t(`admin.communication_template_level_${option.data.level}`)}
                    </Tag>
                  </Space>
                )}
                onChange={handleTemplateChange}
              />
            </Form.Item>

            {selectedTemplate && (
              <>
                {!isWorkshopInviteReminder && !isBookingSummary && !isReportAvailable && !isMagicLink
                  && !isIdpKind && !isWorkshopEventKind && (
                    <Form.Item
                      name="recipients"
                      label={I18n.t('admin.communication_delivery_recipients_label')}
                      rules={[{ required: true }]}
                    >
                      <Select
                        options={RECIPIENTS.map(r => ({
                          value: r,
                          label: I18n.t(`admin.communication_delivery_recipients_${r}`),
                        }))}
                      />
                    </Form.Item>
                )}

                {(isWorkshopInviteReminder || isWorkshopEventKind) && (
                  <Form.Item
                    name="campaignAssessmentGroupId"
                    label={I18n.t('admin.communication_delivery_assessment_group_label')}
                    rules={[{ required: true }]}
                  >
                    <Select
                      options={assessmentGroupOptions.map(group => ({ value: group.id, label: group.name }))}
                    />
                  </Form.Item>
                )}

                {(recipients === 'selected' || isBookingSummary) && (
                  <Form.Item
                    name="selectedUserIds"
                    label={I18n.t('admin.communication_delivery_selected_users_label')}
                    rules={[{ required: true }]}
                  >
                    <Select
                      mode="multiple"
                      showSearch={{
                        filterOption: false,
                        onSearch: value => fetchUsers({ apiConfig: { filter: { search_query: value } } }),
                      }}
                      placeholder={(
                        <Space>
                          <SearchOutlined />
                          {I18n.t('admin.communication_delivery_search_users_placeholder')}
                        </Space>
                      )}
                      notFoundContent={(
                        isLoadingUsers('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')
                      )}
                      onFocus={() => { if (users.length === 0) fetchUsers() }}
                    >
                      {users.map(({ id, name, email }) => (
                        <Select.Option key={id} value={id}>
                          {name}
                          {' '}
                          (
                          {email}
                          )
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                )}

                {scope.campaignId && (
                  <Form.Item
                    name="ccUserIds"
                    label={I18n.t('admin.communication_delivery_cc_users_label')}
                  >
                    <Select
                      mode="multiple"
                      showSearch={{
                        filterOption: false,
                        onSearch: value => fetchCcUsers({
                          apiConfig: { filter: { admins_for_campaign: scope.campaignId || '', search_query: value } },
                        }),
                      }}
                      placeholder={(
                        <Space>
                          <SearchOutlined />
                          {I18n.t('admin.communication_delivery_search_users_placeholder')}
                        </Space>
                      )}
                      notFoundContent={(
                        isLoadingCcUsers('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')
                      )}
                      onFocus={() => { if (ccUsers.length === 0) fetchCcUsers() }}
                    >
                      {ccUsers.map(({ id, name, email }) => (
                        <Select.Option key={id} value={id}>
                          {name}
                          {' '}
                          (
                          {email}
                          )
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                )}

                <Form.Item
                  name="subject"
                  label={I18n.t('admin.communication_template_subject_label')}
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name="body"
                  label={I18n.t('admin.communication_template_body_label')}
                  rules={[{ required: true }]}
                >
                  <input type="hidden" id="resource_kind" value={selectedTemplate.kind} readOnly />
                  <EmailEditor content={body} handleContentChange={handleBodyChange} withPipedText />
                </Form.Item>
              </>
            )}

            <Form.Item
              name="triggerType"
              label={I18n.t('admin.communication_delivery_trigger_type_label')}
              rules={[{ required: true }]}
            >
              <Select
                options={TRIGGER_TYPES.map(type => ({
                  value: type,
                  label: I18n.t(`admin.communication_delivery_trigger_type_${type}`),
                }))}
              />
            </Form.Item>

            {!hasNoDeliveryRule && (
              <Form.Item
                name="deliveryRule"
                label={I18n.t('admin.communication_delivery_rule_label')}
                rules={[{ required: true }]}
              >
                <Select
                  allowClear
                  options={availableDeliveryRules.map(rule => ({
                    value: rule,
                    label: I18n.t(`admin.communication_delivery_rule_${rule}`),
                  }))}
                />
              </Form.Item>
            )}

            {isSpecificDatetime && (
              <Form.Item
                name="deliveryAt"
                label={I18n.t('admin.communication_delivery_at_label')}
                rules={[
                  { required: true },
                  {
                    validator: (_, value) => {
                      if (!value || dayjs(value).isAfter(dayjs())) return Promise.resolve()
                      return Promise.reject(new Error(I18n.t('admin.communication_delivery_at_past_error')))
                    },
                  },
                ]}
              >
                <Input type="datetime-local" />
              </Form.Item>
            )}

            {(isSpecificDatetime || isCompletion) && (
              <Form.Item
                name="deliveryDelayHours"
                label={I18n.t('admin.communication_delivery_delay_hours_label')}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            )}

            {isReminderRule && (
              <>
                <Form.Item
                  name="deliveryIntervalNumber"
                  label={I18n.t('admin.communication_delivery_interval_number_label')}
                >
                  <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                  name="deliveryIntervalPeriod"
                  label={I18n.t('admin.communication_delivery_interval_period_label')}
                >
                  <Select
                    options={INTERVAL_PERIODS.map(period => ({
                      value: period,
                      label: I18n.t(`admin.communication_delivery_interval_period_${period}`),
                    }))}
                  />
                </Form.Item>
              </>
            )}

            {(deliveryRule === 'in_progress' || isCompletion) && (
              <Form.Item
                name="assessmentCompletionStatusCode"
                label={I18n.t('admin.communication_delivery_completion_status_label')}
                extra={I18n.t('admin.communication_delivery_completion_status_hint')}
              >
                <Input />
              </Form.Item>
            )}

            {(deliveryRule === 'not_completed' || isCompletion) && (
              <Form.Item
                name="selectedAssessmentIds"
                label={I18n.t('admin.communication_delivery_selected_assessments_label')}
              >
                <Select
                  mode="multiple"
                  maxCount={isCompletion ? 1 : undefined}
                  loading={isLoadingCampaignAssessments('fetch')}
                  options={campaignAssessments.map(({ assessment }) => (
                    { value: assessment.id, label: assessment.name }
                  ))}
                />
              </Form.Item>
            )}

            {isBookingSummarySchedule && (
              <>
                <Form.Item
                  name="deliveryStartDate"
                  label={I18n.t('admin.communication_delivery_start_date_label')}
                  rules={[{ required: true }]}
                >
                  <Input type="date" />
                </Form.Item>
                <Form.Item
                  name="deliveryEndDate"
                  label={I18n.t('admin.communication_delivery_end_date_label')}
                >
                  <Input type="date" />
                </Form.Item>
                <Form.Item
                  name="deliveryTimeOfDay"
                  label={I18n.t('admin.communication_delivery_time_of_day_label')}
                >
                  <Input type="time" />
                </Form.Item>
                <Form.Item
                  name="deliveryTimezone"
                  label={I18n.t('admin.communication_delivery_timezone_label')}
                >
                  <TimeZoneSelect value="" onChange={() => {}} />
                </Form.Item>
                <Form.Item
                  name="deliveryFrequency"
                  label={I18n.t('admin.communication_delivery_frequency_label')}
                >
                  <Select
                    options={DELIVERY_FREQUENCIES.map(freq => ({
                      value: freq,
                      label: I18n.t(`admin.communication_delivery_frequency_${freq}`),
                    }))}
                  />
                </Form.Item>
                {deliveryFrequency === 'specific_weekdays' && (
                  <Form.Item
                    name="deliveryWeekdays"
                    label={I18n.t('admin.communication_delivery_weekdays_label')}
                    rules={[{ required: true }]}
                  >
                    <Select
                      mode="multiple"
                      options={WEEKDAYS.map(day => ({
                        value: day,
                        label: I18n.t(`admin.communication_delivery_weekday_${day}`),
                      }))}
                    />
                  </Form.Item>
                )}
              </>
            )}
            <Modals modals={{ PipedTextModal }} />
          </>
        )}
      </ResourceFormModal>
    </Provider>
  )
}
