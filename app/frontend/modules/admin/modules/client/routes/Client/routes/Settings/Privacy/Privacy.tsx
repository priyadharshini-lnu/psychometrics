import React, { useEffect } from 'react'
import {
  Row, Col, Form, Checkbox, Button, Skeleton,
} from 'antd'
import { useParams } from 'react-router-dom'
import { useResources } from '~/hooks/useResources'
import ResourceForm from '~/components/ResourceForm'
import { ClientPrivacySettings as PrivacySettingsType } from '~/modules/admin/modules/client/clientPrivacySettings'

const { I18n } = window

export const Privacy: React.FC = () => {
  const { clientId } = useParams() as { clientId: string }
  const [form] = Form.useForm()

  const {
    data, fetch, updateResource, isLoading,
  } = useResources<PrivacySettingsType>(
    'client_privacy_settings',
    {
      basePath: `clients/${clientId}`,
      trackUrl: true,
      apiConfig: { filter: { client_id_eq: clientId } },
    },
  )

  const transformValues = values => ({
    ...values,
  })

  const privacySetting = data[0]

  useEffect(() => {
    fetch()
  }, [clientId])

  useEffect(() => {
    form.setFieldsValue(privacySetting)
  }, [privacySetting])

  if (!privacySetting) return <Skeleton active />

  return (
    <Row justify="space-between" className="pl">
      <Col sm={24} md={16} xl={12} xxl={10}>
        <ResourceForm
          resourceName="privacy_settings"
          readableResourceName="Privacy Settings"
          resource={privacySetting}
          showSuccessMessages
          storeManager={{ form }}
          formProps={{
            labelAlign: 'left',
            id: 'client-privacy-settings-form',
            preserve: false,
            layout: 'horizontal',
          }}
          request={{ updateResource }}
          transformValues={transformValues}
        >
          {() => (
            <>
              <Form.Item name="disableDataProcessing" valuePropName="checked">
                <Checkbox>
                  {I18n.t('admin.disable_dp')}
                </Checkbox>
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="mb-16"
                loading={isLoading(`update@${privacySetting.id}`)}
              >
                {I18n.t('shared.save')}
              </Button>
            </>
          )}
        </ResourceForm>
      </Col>
    </Row>
  )
}
