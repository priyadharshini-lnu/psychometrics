import React, { useState } from 'react'
import {
  Row, Col, Form, Input, Button, Space, message,
} from 'antd'
import { FieldData } from 'rc-field-form/lib/interface'
import { RouteComponentProps, useParams } from 'react-router-dom'
import ResourceForm from 'components/ResourceForm'

interface Params {
  campaignId: string
}

type Props = RouteComponentProps

const { I18n } = window

export const Smtp: React.FC<Props> = ({ }) => {
  const [form] = Form.useForm()
  const [fields, setFields] = useState<FieldData[] | []>([])
  const { projectId } = useParams<{ projectId: string }>()
  
  return (
    <Row justify="space-between" className="pm">
      <Col sm={24} md={8} >
        <ResourceForm
          resourceName="smtpSetting"
          requestScope="campaigns"
          resourceBaseUrl={`/administration/projects/${projectId}/users`}
          resource={{
            id: 10
          }}
          storeManager={{ form, fields, setFields }}
          showSuccessMessages
        >
          {({ form }) => (
            <>
              <Form.Item
                name="host"
                label={I18n.t('campaign_report.column.report_bundle')}
                rules={[{ required: true }]}
                >
                  <Input />
              </Form.Item>
              <Button type='primary' htmlType='submit'>Save</Button>
            </>
          )}
        </ResourceForm>
      </Col>
    </Row>
  )
}
