import React, { useState } from 'react'
import {
  Form, Input, Checkbox, Radio, Switch, Row, Col,
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
  const { projectId } = useParams<{ projectId: string }>()
  const [authType, setAuthType] = useState(webhook?.authType || 'no_auth')

  const handleAuthTypeChange = (e) => {
    setAuthType(e.target.value)
  }

  const topics = [
    'assessment_started',
    'assessment_completed',
    'assessment_timeout',
    'results_available',
    'report_available',
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
      >
        {() => (
          <>
            <Form.Item
              name={I18n.t('administration.project_tabs.webhooks.form.description.name')}
              label={I18n.t('administration.project_tabs.webhooks.form.description.label')}
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name={I18n.t('administration.project_tabs.webhooks.form.url.name')}
              label={I18n.t('administration.project_tabs.webhooks.form.url.label')}
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
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
              label={I18n.t('administration.project_tabs.webhooks.form.active.name')}
              valuePropName="checked"
              initialValue={webhook?.active || true}
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
          </>
        )}
      </ResourceFormModal>
    </>
  )
}
