import React from 'react'
import { Form, Input } from 'antd'
import { APIKey } from 'modules/admin/modules/client/core/apiKeys'
import ResourceFormModal from '~/components/ResourceFormModal'
import { useResourceContext } from '~/modules/admin/components/Resource'

interface Props {
  close(): void
  apiKey?: APIKey
}

const { I18n } = window

export const APIKeysFormModal: React.FC<Props> = ({ close, apiKey }) => {
  const { resource } = useResourceContext()
  const [form] = Form.useForm()

  return (
    <ResourceFormModal
      resourceName="api_key"
      resource={apiKey}
      readableResourceName={I18n.t('administration.api_keys.form.title')}
      showSuccessMessages
      close={close}
      storeManager={{ form }}
      scrollToFirstError
      modalProps={{ width: 720 }}
      request={{ createResource: resource.createResource, updateResource: resource.updateResource }}
    >
      {() => (
        <>
          <Form.Item
            name="description"
            label={I18n.t('administration.api_keys.form.description')}
          >
            <Input />
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}
