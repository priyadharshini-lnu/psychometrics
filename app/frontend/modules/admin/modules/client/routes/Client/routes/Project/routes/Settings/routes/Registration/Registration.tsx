import React, { useState, useEffect } from 'react'
import {
  Row, Col, Form, Button, App, Checkbox, Table,
} from 'antd'
import { useParams } from 'react-router-dom'
import { useResources } from '~/hooks/useResources/useResources'
import {
  RegistrationSettings as RegistrationSettingsType,
} from '~/modules/admin/modules/client/core/registrationSettings'

const { I18n } = window
const { Column } = Table

interface Field {
  index: string
  name: string
  enabled: boolean
}

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
      requireMobileNumber: data.requireMobileNumber,
    }])
  }

  const onFinish = (values) => {
    updateResource({
      id: registrationSettings.id,
      ...values,
      requireMobileNumber: registrationSettings.requireMobileNumber,
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
          <Table
            pagination={false}
            dataSource={[
              {
                name: I18n.t('administration.projects.registration_settings.require_mobile_number'),
                enabled: registrationSettings.requireMobileNumber,
              }]}
            rowKey="name"
          >
            <Column title={I18n.t('administration.projects.registration_settings.name_label')} dataIndex="name" />
            <Column
              title="Enabled"
              dataIndex="enabled"
              render={(_, row:Field) => (
                <Checkbox
                  onChange={e => updateEnabledSettings({ requireMobileNumber: e.target.checked })}
                  checked={row.enabled}
                />
              )}
            />
          </Table>
          <Row className="mt-4">
            <Button type="primary" htmlType="submit" className="mb-16" loading={isSaving}>
              {I18n.t('administration.save')}
            </Button>
          </Row>
        </Form>
      </Col>
    </Row>
  )
}
