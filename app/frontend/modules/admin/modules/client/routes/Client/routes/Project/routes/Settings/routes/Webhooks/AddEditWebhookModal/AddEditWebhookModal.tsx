import React, { useState } from 'react'
import {
  Form, Input, InputNumber, Space, Checkbox, Radio, Switch, Row, Col,
  Typography,
} from 'antd'
import { useParams } from 'react-router-dom'
import _ from 'lodash'
import { CreateResource, UpdateResource } from '~/hooks/useResources/interfaces'
import ResourceFormModal from '~/components/ResourceFormModal'
import styles from './styles.less'
import { Webhook } from '~/modules/admin/modules/client/core/webhooks'

const { I18n } = window

interface Props {
  addWebhook: CreateResource<Webhook | {projectIdId: string }>
  updateWebhook: UpdateResource<Webhook>
  webhook: Webhook
  close(): void
}

export const AddEditWebhookModal: React.FC<Props> = ({
  addWebhook,
  updateWebhook,
  webhook,
  close,
}) => {
  const { projectId } = useParams() as { projectId: string }
  const [authType, setAuthType] = useState(webhook?.authType || 'no_auth')

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
    'campaign_user_status',
    'campaign_results_available',
  ]

  return (
    <>
      <ResourceFormModal
        resourceName="webhooks"
        resource={webhook}
        readableResourceName="Webhook"
        showSuccessMessages
        close={close}
        scrollToFirstError
        modalProps={{ width: 620 }}
        request={{
          createResource: values => addWebhook({ ...values, projectId }),
          updateResource: updateWebhook,
        }}
        formProps={{
          initialValues: { rateLimit: 60, rateLimitPeriod: 1 },
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
              name={I18n.t('administration.project_tabs.webhooks.form.topics.name')}
              label={I18n.t('administration.project_tabs.webhooks.form.topics.label')}
            >
              <Checkbox.Group>
                <Row>
                  {_.map(topics, topic => (
                    <Col className={styles.topics_columns}>
                      <Checkbox value={topic} className={styles.topics_checkbox}>
                        {I18n.t(`administration.project_tabs.webhooks.form.topics.list.${topic}`)}
                      </Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </Form.Item>
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
          </>
        )}
      </ResourceFormModal>
    </>
  )
}
