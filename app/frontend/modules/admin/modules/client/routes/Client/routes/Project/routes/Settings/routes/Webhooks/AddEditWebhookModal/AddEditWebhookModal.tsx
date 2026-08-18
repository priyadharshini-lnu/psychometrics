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
              name={I18n.t('admin.description_name')}
              label={I18n.t('shared.description')}
              rules={[{ required: true }]}
            >
              <Input name="webhook_description" />
            </Form.Item>
            <Form.Item
              name={I18n.t('admin.url_name')}
              label={I18n.t('admin.url_label')}
              rules={[{ required: true }]}
            >
              <Input name="webhook_url" />
            </Form.Item>

            <Typography.Paragraph strong>
              {I18n.t('admin.acceptable_rate_limit_label')}
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
                label={I18n.t('admin.acceptable_rate_limit_request_per')}
                labelAlign="left"
                layout="horizontal"
                colon={false}
              >
                <InputNumber />
              </Form.Item>
              <Typography.Text strong>{I18n.t('admin.common_minute')}</Typography.Text>
            </Space>

            <Form.Item
              name="topics"
              label={I18n.t('admin.topics_label')}
            >
              <Checkbox.Group className={styles.topics_grid}>
                {_.map(topics, topic => (
                  <Checkbox value={topic} className={styles.topics_checkbox}>
                    {I18n.t(`admin.topics_list_${topic}`)}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            </Form.Item>

            {selectedTopics.includes('assessment_raw_response') && (
              <Form.Item
                name="assessmentIds"
                label={I18n.t('admin.assessments_label')}
                rules={[{
                  required: true,
                  message: I18n.t('admin.assessments_required'),
                }]}
                extra={I18n.t('admin.assessments_help_text')}
              >
                <Select
                  mode="multiple"
                  showSearch={{ filterOption: false, onSearch: handleAssessmentSearch }}
                  placeholder={I18n.t('admin.assessments_placeholder')}
                  options={assessmentOptions}
                />
              </Form.Item>
            )}

            <Form.Item
              name={I18n.t('admin.active_name')}
              label={I18n.t('admin.active_label')}
              valuePropName="checked"
              initialValue={webhook?.active || true}
            >
              <Switch />
            </Form.Item>
            <Form.Item
              name={I18n.t('admin.include_locales_name')}
              label={I18n.t('admin.include_locales_label')}
              valuePropName="checked"
              initialValue={webhook?.includeLocales || false}
            >
              <Switch />
            </Form.Item>
            <Form.Item
              name={I18n.t('admin.auth_type_name')}
              label={I18n.t('admin.auth_type_label')}
              initialValue={authType}
            >
              <Radio.Group onChange={handleAuthTypeChange}>
                <Radio
                  value={
                    I18n.t('admin.auth_type_no_auth_value')
                  }
                >
                  {I18n.t('admin.auth_type_no_auth_label')}
                </Radio>
                <Radio
                  value={
                    I18n.t('admin.auth_type_basic_value')
                  }
                >
                  {I18n.t('admin.auth_type_basic_label')}
                </Radio>
                <Radio
                  value={
                    I18n.t('admin.auth_type_api_key_value')
                  }
                >
                  {I18n.t('admin.auth_type_api_key_label')}
                </Radio>
                <Radio
                  value={
                    I18n.t('admin.auth_type_oauth_value')
                  }
                >
                  {I18n.t('admin.auth_type_oauth_label')}
                </Radio>
              </Radio.Group>
            </Form.Item>

            {authType === I18n.t('admin.auth_type_basic_value') && (
              <>
                <Form.Item
                  name={I18n.t('admin.username_name')}
                  label={I18n.t('admin.username_label')}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name={I18n.t('admin.password_name')}
                  label={I18n.t('admin.password_label')}
                >
                  <Input.Password />
                </Form.Item>
              </>
            )}

            {authType === I18n.t('admin.auth_type_api_key_value') && (
              <>
                <Form.Item
                  name={I18n.t('admin.auth_type_api_key_header_name')}
                  label={I18n.t('admin.auth_type_api_key_header_label')}
                  rules={[
                    {
                      pattern: /^[a-zA-Z0-9_-]+$/,
                      message: I18n.t(
                        'admin.auth_type_api_key_header_format_error',
                      ),
                    },
                  ]}
                >
                  <Input placeholder="X-API-KEY" />
                </Form.Item>
                <Form.Item
                  name={I18n.t('admin.auth_type_api_key_name')}
                  label={I18n.t('admin.auth_type_api_key_label')}
                >
                  <Input.Password />
                </Form.Item>
              </>
            )}

            {authType === I18n.t('admin.auth_type_oauth_value') && (
              <>
                <Form.Item
                  name={I18n.t('admin.grant_type_name')}
                  label={I18n.t('admin.grant_type_label')}
                  initialValue={I18n.t('admin.client_credentials_value')}
                  rules={[{ required: true }]}
                >
                  <Select
                    placeholder="Select grant type"
                    defaultValue={I18n.t('admin.client_credentials_label')}
                  >
                    <Select.Option
                      value={I18n.t('admin.client_credentials_value')}
                    >
                      {I18n.t(
                        'admin.client_credentials_label',
                      )}
                    </Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name={I18n.t('admin.token_url_name')}
                  label={I18n.t('admin.token_url_label')}
                  initialValue={webhook?.oauthTokenUrl}
                  rules={[{
                    required: true,
                    message: I18n.t('admin.token_url_required'),
                  }]}
                >
                  <Input />
                </Form.Item>
                {!webhook || isEditingClientId ? (
                  <Form.Item
                    name={I18n.t('admin.client_id_name')}
                    label={I18n.t('admin.client_id_label')}
                    rules={[{
                      required: true,
                      message: I18n.t('admin.client_id_required'),
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
                    label={I18n.t('admin.client_id_label')}
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
                    name={I18n.t('admin.client_secret_name')}
                    label={I18n.t('admin.client_secret_label')}
                    rules={[{
                      required: true,
                      message: I18n.t('admin.client_secret_required'),
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
                    label={I18n.t('admin.client_secret_label')}
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
                  name={I18n.t('admin.oauth_scope_name')}
                  label={I18n.t('admin.oauth_scope_label')}
                  initialValue={webhook?.oauthScope}
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
