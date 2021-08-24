import React, { useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Row, Col, Form, Input, Button, Space, message, Switch, Radio,
} from 'antd'
import { RootState } from 'modules/admin/core/rootReducers'
import {
  get as getSmtpSetting,
} from 'modules/admin/modules/projects/core/smtpSetting'
import { FieldData } from 'rc-field-form/lib/interface'
import { RouteComponentProps, useParams } from 'react-router-dom'
import ResourceForm from 'components/ResourceForm'

const connector = connect(
  (state: RootState) => ({
    smtpSetting: getSmtpSetting(state),
  }),
  {
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux

const { I18n } = window

const SmtpComponent: React.FC<Props> = ({ smtpSetting }) => {
  const [form] = Form.useForm()
  const [fields, setFields] = useState<FieldData[] | []>([])
  const { projectId } = useParams<{ projectId: string }>()
  
  return (
    <Row justify="space-between" className="pl">
      <Col sm={24} md={8}>
        <ResourceForm
          resourceName="smtpSetting"
          requestScope="campaigns"
          resourceBaseUrl={`/administration/projects/${projectId}/smtp_settings`}
          resource={smtpSetting}
          storeManager={{ form, fields, setFields }}
          showSuccessMessages
          formProps={{ layout: "horizontal", labelCol: { sm: 24, md: 10, lg: 8, xl: 8 }, labelAlign: 'left' }}
        >
          {({ form }) => (
            <>
              <Form.Item
                name="enabled"
                label={I18n.t('administration.smtp_settings.enabled')}
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="fromName"
                label={I18n.t('administration.smtp_settings.from_name')}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="fromEmail"
                label={I18n.t('administration.smtp_settings.from_email')}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="host"
                label={I18n.t('administration.smtp_settings.host')}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="port"
                label={I18n.t('administration.smtp_settings.port')}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="encryption"
                label={I18n.t('administration.smtp_settings.encryption')}
              >
                <Radio.Group>
                  <Radio value='none'>{I18n.t('administration.smtp_settings.encryption_types.none')}</Radio>
                  <Radio value='ssl'>{I18n.t('administration.smtp_settings.encryption_types.ssl')}</Radio>
                  <Radio value='tls'>{I18n.t('administration.smtp_settings.encryption_types.tls')}</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="authentication"
                label={I18n.t('administration.smtp_settings.authentication')}
              >
                <Switch />
              </Form.Item>

              {form.getFieldValue('authentication') &&
                <>
                  <Form.Item
                    name="authenticationType"
                    label={I18n.t('administration.smtp_settings.authentication_type')}
                  >
                    <Radio.Group>
                      <Radio value='plain'>{I18n.t('administration.smtp_settings.authentication_types.plain')}</Radio>
                      <Radio value='login'>{I18n.t('administration.smtp_settings.authentication_types.login')}</Radio>
                      <Radio value='cram_md5'>{I18n.t('administration.smtp_settings.authentication_types.cram_md5')}</Radio>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item
                    name="userName"
                    label={I18n.t('administration.smtp_settings.user_name')}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    label={I18n.t('administration.smtp_settings.password')}
                  >
                    <Input />
                  </Form.Item>
                </>
              }
              <Button type='primary' htmlType='submit'>Save</Button>
            </>
          )}
        </ResourceForm>
      </Col>
    </Row>
  )
}

export const Smtp = connector(SmtpComponent)