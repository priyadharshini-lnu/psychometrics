import React from 'react'
import { Form, Input } from 'antd'
import ResourceFormModal from '~/components/ResourceFormModal'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { Application } from '~/modules/admin/modules/client/core/applications'

interface Props {
  close(): void
}

const { I18n } = window

const NAME_PATTERN = /^[a-zA-Z0-9]+( [a-zA-Z0-9]+)*$/

export const ApplicationFormModal: React.FC<Props> = ({ close }) => {
  const { resource } = useResourceContext<Application>()
  const [form] = Form.useForm()

  return (
    <ResourceFormModal
      resourceName="applications"
      readableResourceName={I18n.t('admin.application')}
      showSuccessMessages
      close={close}
      storeManager={{ form }}
      scrollToFirstError
      modalProps={{ width: 520 }}
      request={{ createResource: resource.createResource }}
    >
      {() => (
        <Form.Item
          name="name"
          label={I18n.t('admin.application_name')}
          rules={[
            { required: true },
            {
              pattern: NAME_PATTERN,
              message: I18n.t('admin.application_name_format_hint'),
            },
          ]}
        >
          <Input />
        </Form.Item>
      )}
    </ResourceFormModal>
  )
}
