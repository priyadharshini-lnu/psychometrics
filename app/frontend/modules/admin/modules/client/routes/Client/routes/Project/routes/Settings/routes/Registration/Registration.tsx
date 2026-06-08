import React, { useState, useEffect } from 'react'
import {
  Row, Col, Form, Button, App, Checkbox,
} from 'antd'
import { useParams } from 'react-router-dom'
import { useResources } from '~/hooks/useResources/useResources'
import {
  RegistrationSettings as RegistrationSettingsType,
} from '~/modules/admin/modules/client/core/registrationSettings'

const { I18n } = window

export const Registration: React.FC<{}> = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const {
    data, updateResource, fetch, isLoading, setData,
  } = useResources<RegistrationSettingsType>(
    'registration_settings',
    {
      basePath: `projects/${projectId}`,
      trackUrl: true,
    },
  )

  const [form] = Form.useForm()
  const [registrationSettings] = data
  const [values, setValues] = useState({})
  const { message } = App.useApp()

  useEffect(() => {
    if (registrationSettings) {
      form.setFieldsValue(registrationSettings)
    }
  }, [registrationSettings])

  useEffect(() => {
    fetch()
  }, [])

  const updateEnabledSettings = (data) => {
    setData([{
      ...registrationSettings,
      ...data,
    }])
  }

  const onFinish = (values) => {
    updateResource({
      id: registrationSettings.id,
      ...values,
      requireMobileNumber: registrationSettings.requireMobileNumber,
      hideSignup: registrationSettings.hideSignup,
    }).then(() => {
      message.success(I18n.t('registration.success_update'))
    })
  }

  const isSaving = isLoading(`update@${data[0]?.id}`)

  if (!registrationSettings) { return null }

  return (
    <Row justify="space-between" className="pl">
      <Col sm={24} md={16} xl={12} xxl={10}>
        <Form
          name="profile"
          onValuesChange={value => setValues({ ...values, ...value })}
          layout="horizontal"
          labelAlign="left"
          form={form}
          labelCol={{
            sm: 24,
            md: 10,
            lg: 8,
            xl: 8,
          }}
          onFinish={onFinish}
          initialValues={registrationSettings}
        >
          <Form.Item
            name="requireMobileNumber"
            label={I18n.t('admin.projects_registration_settings_require_mobile_number')}
            valuePropName="checked"
          >
            <Checkbox
              checked={registrationSettings.requireMobileNumber}
              onChange={e => updateEnabledSettings({ requireMobileNumber: e.target.checked })}
            />
          </Form.Item>
          <Form.Item
            name="hideSignup"
            label={I18n.t('admin.projects_registration_settings_hide_signup')}
            valuePropName="checked"
          >
            <Checkbox
              checked={registrationSettings.hideSignup}
              onChange={e => updateEnabledSettings({ hideSignup: e.target.checked })}
            />
          </Form.Item>
          <Row className="mt-4">
            <Button type="primary" htmlType="submit" className="mb-16" loading={isSaving}>
              {I18n.t('shared.save')}
            </Button>
          </Row>
        </Form>
      </Col>
    </Row>
  )
}
