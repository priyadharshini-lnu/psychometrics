import React, { useState, useEffect } from 'react'
import {
  Row, Col, Form, Switch, Button,
  Flex,
} from 'antd'
import { useParams } from 'react-router-dom'
import { IdpSettings, IdpSettingsTR } from '~/modules/admin/modules/client/core/idpSettings'
import { useResources } from '~/hooks/useResources/useResources'
import ResourceForm from '~/components/ResourceForm'

const { I18n } = window

export const Settings: React.FC = () => {
  const { projectId } = useParams() as { projectId: string }
  const [isLoading, setIsLoading] = useState(false)
  const {
    data, updateResource, fetch,
  } = useResources<IdpSettings>('idp_settings', {
    responseType: IdpSettingsTR,
  })
  const [form] = Form.useForm()
  const [idpSettings] = data

  useEffect(() => {
    if (idpSettings) {
      form.setFieldsValue(idpSettings)
      setIsLoading(false)
    }
  }, [idpSettings])

  useEffect(() => {
    fetch({
      apiConfig: {
        filter: { project_id_eq: projectId },
        include_meta: ['permissions'],
      },
    })
  }, [])

  return (
    <Row justify="space-between" className="pl" gutter={16}>
      <Col sm={24} md={16} xl={12} xxl={10}>
        <ResourceForm
          resourceName="idp_setting"
          readableResourceName="IDP Settings"
          resource={idpSettings}
          showSuccessMessages
          storeManager={{ form }}
          request={{
            updateResource,
          }}
          scrollToFirstError
        >
          {() => (
            <Flex vertical gap={16}>
              <Flex gap={8} align="center">
                <Form.Item
                  name="managerApprovesIdp"
                  valuePropName="checked"
                  className="mb-0"
                >
                  <Switch />
                </Form.Item>
                {I18n.t('admin.idp_setting_manager_approves_idp')}
              </Flex>
              <Flex gap={8} align="center">
                <Form.Item
                  name="managerCanEditIdp"
                  valuePropName="checked"
                  className="mb-0"
                >
                  <Switch />
                </Form.Item>
                {I18n.t('admin.idp_setting_manager_can_edit_idp')}
              </Flex>
              <Flex gap={8} align="center">

                <Form.Item
                  name="requireAllDevelopmentActionsComplete"
                  valuePropName="checked"
                  className="mb-0"
                >
                  <Switch />
                </Form.Item>
                {I18n.t('admin.idp_setting_require_all_development_actions_complete')}
              </Flex>
              <Button
                type="primary"
                htmlType="submit"
                className="mb-16"
                loading={isLoading}
                style={{ alignSelf: 'flex-start' }}
              >
                {I18n.t('shared.save')}
              </Button>
            </Flex>
          )}
        </ResourceForm>
      </Col>
    </Row>
  )
}
