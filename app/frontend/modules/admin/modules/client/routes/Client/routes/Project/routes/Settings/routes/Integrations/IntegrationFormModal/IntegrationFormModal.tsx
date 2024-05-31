import React, { useState } from 'react'
import { Form, Switch, Select } from 'antd'
import { useParams } from 'react-router-dom'
import { FieldData } from 'rc-field-form/lib/interface'
import { Integration, integrationNames } from '~/modules/admin/modules/client/core/integrations'
import ResourceFormModal from '~/components/ResourceFormModal'
import { IihtForm } from './IihtForm'

const { Option } = Select
const { I18n } = window

const integrationComponents = {
  iiht: IihtForm,
}

type OwnProps = {
  integration: Integration | undefined
  close(): void
}
type Props = OwnProps

export const IntegrationFormModal: React.FC<Props> = ({
  integration,
  close,
}) => {
  const [form] = Form.useForm()
  const [fields, setFields] = useState<FieldData[]>([])
  const { projectId } = useParams() as { projectId: string }
  const integrationName = integration?.name || form.getFieldValue('name')
  const IntegrationComponent = integrationComponents[integrationName]

  return (
    <ResourceFormModal
      resourceName="integrations"
      readableResourceName={I18n.t('administration.integrations.integrations')}
      requestScope="campaigns"
      resourceBaseUrl={`/administration/projects/${projectId}/integrations`}
      resource={integration}
      showSuccessMessages
      close={close}
      modalProps={{ width: 550 }}
      storeManager={{ form, fields, setFields }}
      scrollToFirstError
    >
      {() => (
        <>
          <Form.Item
            name="active"
            label={I18n.t('administration.integrations.columns.active')}
            initialValue={false}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="name"
            label={I18n.t('administration.integrations.columns.name')}
            rules={[{ required: true }]}
          >
            <Select
              className="w-100"
              onChange={() => {}}
            >
              {integrationNames.map(
                name => <Option key={name} value={name}>{I18n.t(`administration.integrations.names.${name}`)}</Option>,
              )}
            </Select>
          </Form.Item>
          {IntegrationComponent && <IntegrationComponent integration={integration} />}
        </>
      )}
    </ResourceFormModal>
  )
}
