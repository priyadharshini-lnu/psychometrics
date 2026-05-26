import React, { useState, useEffect } from 'react'
import {
  Form, Input, InputNumber, Space, Checkbox, Radio, Switch,
  Typography, Select,
} from 'antd'
import { useParams } from 'react-router-dom'
import _ from 'lodash'
import { EditOutlined, CloseOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { CreateResource, UpdateResource } from '~/hooks/useResources/interfaces'
import { useResources } from '~/hooks/useResources'
import ResourceFormModal from '~/components/ResourceFormModal'
import styles from './styles.less'
import { Webhook } from '~/modules/admin/modules/client/core/webhooks'
import { Assessment } from '~/modules/admin/modules/client/core/assessments'

const { I18n } = window

interface Props {
  addWebhook: CreateResource<Webhook | {projectIdId: string }>
  updateWebhook: UpdateResource<Webhook>
  webhook: Webhook
  close(): void
  clientId: string
}

export const AddEditWebhookModal: React.FC<Props> = ({
  addWebhook,
  updateWebhook,
  webhook,
  close,
  clientId,
}) => {
  const { projectId } = useParams() as { projectId: string }
  const [authType, setAuthType] = useState(webhook?.authType || 'no_auth')
  const [isEditingClientId, setIsEditingClientId] = useState(!webhook)
  const [isEditingClientSecret, setIsEditingClientSecret] = useState(!webhook)
  const [form] = Form.useForm()

  const selectedTopics = Form.useWatch(
    'topics',
    form,
  ) || []

  const { data: assessments, fetch: fetchAssessments } = useResources<Assessment>('assessments', {
    apiConfig: {
      fields: {
        assessments: ['id', 'name'],
      },
      filter: {
        owner_id_eq: clientId,
        category_in: ['psychometric', 'organisational'],
      },
    },
  })

  useEffect(() => {
    fetchAssessments()
  }, [])

  const handleAssessmentSearch = (value: string) => {
    fetchAssessments({
      apiConfig: {
        filter: {
          owner_id_eq: clientId,
          category_in: ['psychometric', 'organisational'],
          filterable_fields: value,
        },
      },
    })
  }

  const handleAuthTypeChange = (e) => {
    setAuthType(e.target.value)
  }

  const topics = [
    'assessment_started',
    'assessment_completed',
    'assessment_timeout',
    'assessment_assigned',
    'results_available',
    'report_available',
    'scheduling_invited',
    'scheduling_scheduled',
    'scheduling_cancelled',
    'scheduling_rescheduled',
    'workshop_attendance_status',
    'campaign_user_status',
    'campaign_results_available',
    'assessment_raw_response',
    'campaign_user_assessment_summary',
  ]

  const assessmentOptions = _.uniqBy([
    ...(webhook?.assessments || []),
    ...assessments,
  ], 'id').map(assessment => ({
    label: assessment.name,
    value: assessment.id,
  }))

  return (
    <>
      <ResourceFormModal
        resourceName="webhooks"
        resource={webhook}
        readableResourceName="Webhook"
        showSuccessMessages
        storeManager={{ form }}
        close={close}
        scrollToFirstError
        modalProps={{ width: 900 }}
        request={{
          createResource: values => addWebhook({ ...values, projectId }),
          updateResource: updateWebhook,
        }}
        formProps={{
          initialValues: {
            rateLimit: 60,
            rateLimitPeriod: 1,
            ...webhook,
          },
        }}
      >
        {() => (
          <>
            <Form.Item
              name={I18n.t('administration.project_tabs.webhooks.form.description.name')}
              label={I18n.t('administration.project_tabs.webhooks.form.description.label')}
              rules={[{ required: true }]}
            >
              <Input name="webhook_description" />
            </Form.Item>
            <Form.Item
              name={I18n.t('administration.project_tabs.webhooks.form.url.name')}
              label={I18n.t('administration.project_tabs.webhooks.form.url.label')}
              rules={[{ required: true }]}
            >
              <Input name="webhook_url" />
            </Form.Item>

            <Typography.Paragraph strong>
              {I18n.t('administration.project_tabs.webhooks.form.acceptable_rate_limit.label')}
            </Typography.Paragraph>
            <Space align="baseline">
              <Form.Item
                name="rateLimit"
                layout="horizontal"
                colon={false}
              >
                <InputNumber />
              </Form.Item>
              <Form.Item
                name="rateLimitPeriod"
                label={I18n.t('administration.project_tabs.webhooks.form.acceptable_rate_limit.request_per')}
                labelAlign="left"
                layout="horizontal"
                colon={false}
              >
                <InputNumber />
              </Form.Item>
              <Typography.Text strong>{I18n.t('administration.common.minute')}</Typography.Text>
            </Space>

            <Form.Item
              name="topics"
              label={I18n.t('administration.project_tabs.webhooks.form.topics.label')}
            >
              <Checkbox.Group className={styles.topics_grid}>
                {_.map(topics, topic => (
                  <Checkbox value={topic} className={styles.topics_checkbox}>
                    {I18n.t(`administration.project_tabs.webhooks.form.topics.list.${topic}`)}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            </Form.Item>

            {selectedTopics.includes('assessment_raw_response') && (
              <Form.Item
                name="assessmentIds"
                label={I18n.t('administration.project_tabs.webhooks.form.assessments.label')}
                rules={[{
                  required: true,
                  message: I18n.t('administration.project_tabs.webhooks.form.assessments.required'),
                }]}
                extra={I18n.t('administration.project_tabs.webhooks.form.assessments.help_text')}
              >
                <Select
                  mode="multiple"
                  showSearch={{ filterOption: false, onSearch: handleAssessmentSearch }}
                  placeholder={I18n.t('administration.project_tabs.webhooks.form.assessments.placeholder')}
                  options={assessmentOptions}
                />
              </Form.Item>
            )}

            <Form.Item
              name={I18n.t('administration.project_tabs.webhooks.form.active.name')}
              label={I18n.t('administration.project_tabs.webhooks.form.active.label')}
              valuePropName="checked"
              initialValue={webhook?.active || true}
            >
              <Switch />
            </Form.Item>
            <Form.Item
              name={I18n.t('administration.project_tabs.webhooks.form.include_locales.name')}
              label={I18n.t('administration.project_tabs.webhooks.form.include_locales.label')}
              valuePropName="checked"
              initialValue={webhook?.includeLocales || false}
            >
              <Switch />
            </Form.Item>
            <Form.Item
              name={I18n.t('administration.project_tabs.webhooks.form.auth_type.name')}
              label={I18n.t('administration.project_tabs.webhooks.form.auth_type.label')}
              initialValue={authType}
            >
              <Radio.Group onChange={handleAuthTypeChange}>
                <Radio
                  value={
                    I18n.t('administration.project_tabs.webhooks.form.auth_type.no_auth.value')
                  }
                >
                  {I18n.t('administration.project_tabs.webhooks.form.auth_type.no_auth.label')}
                </Radio>
                <Radio
                  value={
                    I18n.t('administration.project_tabs.webhooks.form.auth_type.basic.value')
                  }
                >
                  {I18n.t('administration.project_tabs.webhooks.form.auth_type.basic.label')}
                </Radio>
                <Radio
                  value={
                    I18n.t('administration.project_tabs.webhooks.form.auth_type.api_key.value')
                  }
                >
                  {I18n.t('administration.project_tabs.webhooks.form.auth_type.api_key.label')}
                </Radio>
                <Radio
                  value={
                    I18n.t('administration.project_tabs.webhooks.form.auth_type.oauth.value')
                  }
                >
                  {I18n.t('administration.project_tabs.webhooks.form.auth_type.oauth.label')}
                </Radio>
              </Radio.Group>
            </Form.Item>

            {authType === I18n.t('administration.project_tabs.webhooks.form.auth_type.basic.value') && (
              <>
                <Form.Item
                  name={I18n.t('administration.project_tabs.webhooks.form.username.name')}
                  label={I18n.t('administration.project_tabs.webhooks.form.username.label')}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name={I18n.t('administration.project_tabs.webhooks.form.password.name')}
                  label={I18n.t('administration.project_tabs.webhooks.form.password.label')}
                >
                  <Input.Password />
                </Form.Item>
              </>
            )}

            {authType === I18n.t('administration.project_tabs.webhooks.form.auth_type.api_key.value') && (
              <>
                <Form.Item
                  name={I18n.t('administration.project_tabs.webhooks.form.auth_type.api_key_header.name')}
                  label={I18n.t('administration.project_tabs.webhooks.form.auth_type.api_key_header.label')}
                  rules={[
                    {
                      pattern: /^[a-zA-Z0-9_-]+$/,
                      message: I18n.t(
                        'administration.project_tabs.webhooks.form.auth_type.api_key_header.format_error',
                      ),
                    },
                  ]}
                >
                  <Input placeholder="X-API-KEY" />
                </Form.Item>
                <Form.Item
                  name={I18n.t('administration.project_tabs.webhooks.form.auth_type.api_key.name')}
                  label={I18n.t('administration.project_tabs.webhooks.form.auth_type.api_key.label')}
                >
                  <Input.Password />
                </Form.Item>
              </>
            )}

            {authType === I18n.t('administration.project_tabs.webhooks.form.auth_type.oauth.value') && (
              <>
                <Form.Item
                  name={I18n.t('administration.project_tabs.webhooks.form.grant_type.name')}
                  label={I18n.t('administration.project_tabs.webhooks.form.grant_type.label')}
                  initialValue={I18n.t('administration.project_tabs.webhooks.form.client_credentials.value')}
                  rules={[{ required: true }]}
                >
                  <Select
                    placeholder="Select grant type"
                    defaultValue={I18n.t('administration.project_tabs.webhooks.form.client_credentials.label')}
                  >
                    <Select.Option
                      value={I18n.t('administration.project_tabs.webhooks.form.client_credentials.value')}
                    >
                      {I18n.t(
                        'administration.project_tabs.webhooks.form.client_credentials.label',
                      )}
                    </Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name={I18n.t('administration.project_tabs.webhooks.form.token_url.name')}
                  label={I18n.t('administration.project_tabs.webhooks.form.token_url.label')}
                  initialValue={webhook?.oauthTokenUrl}
                  rules={[{
                    required: true,
                    message: I18n.t('administration.project_tabs.webhooks.form.token_url.required'),
                  }]}
                >
                  <Input />
                </Form.Item>
                {!webhook || isEditingClientId ? (
                  <Form.Item
                    name={I18n.t('administration.project_tabs.webhooks.form.client_id.name')}
                    label={I18n.t('administration.project_tabs.webhooks.form.client_id.label')}
                    rules={[{
                      required: true,
                      message: I18n.t('administration.project_tabs.webhooks.form.client_id.required'),
                    }]}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Input.Password
                        style={{ flex: 1 }}
                        autoFocus={webhook !== undefined}
                      />
                      {webhook && (
                        <CloseOutlined
                          className="cursor-pointer ms-8"
                          onClick={() => {
                            setIsEditingClientId(false)
                          }}
                        />
                      )}
                    </div>
                  </Form.Item>
                ) : (
                  <Form.Item
                    label={I18n.t('administration.project_tabs.webhooks.form.client_id.label')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Input
                        disabled
                        value={webhook?.oauthClientId ?? ''}
                        style={{ flex: 1 }}
                      />
                      <EditOutlined
                        className="cursor-pointer ms-8"
                        onClick={() => {
                          setIsEditingClientId(true)
                        }}
                      />
                    </div>
                  </Form.Item>
                )}
                {!webhook || isEditingClientSecret ? (
                  <Form.Item
                    name={I18n.t('administration.project_tabs.webhooks.form.client_secret.name')}
                    label={I18n.t('administration.project_tabs.webhooks.form.client_secret.label')}
                    rules={[{
                      required: true,
                      message: I18n.t('administration.project_tabs.webhooks.form.client_secret.required'),
                    }]}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Input.Password
                        style={{ flex: 1 }}
                        autoFocus={webhook !== undefined}
                      />
                      {webhook && (
                        <CloseOutlined
                          className="cursor-pointer ms-8"
                          onClick={() => {
                            setIsEditingClientSecret(false)
                          }}
                        />
                      )}
                    </div>
                  </Form.Item>
                ) : (
                  <Form.Item
                    label={I18n.t('administration.project_tabs.webhooks.form.client_secret.label')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Input
                        disabled
                        value={webhook?.oauthClientId ?? ''}
                        style={{ flex: 1 }}
                      />
                      <EditOutlined
                        className="cursor-pointer ms-8"
                        onClick={() => {
                          setIsEditingClientSecret(true)
                        }}
                      />
                    </div>
                  </Form.Item>
                )}
                <Form.Item
                  name={I18n.t('administration.project_tabs.webhooks.form.oauth_scope.name')}
                  label={I18n.t('administration.project_tabs.webhooks.form.oauth_scope.label')}
                  initialValue={webhook?.oauthScope}
                  rules={[{
                    required: true,
                    message: I18n.t('administration.project_tabs.webhooks.form.oauth_scope.required'),
                  }]}
                >
                  <Input />
                </Form.Item>
              </>
            )}

          </>
        )}
      </ResourceFormModal>
    </>
  )
}
