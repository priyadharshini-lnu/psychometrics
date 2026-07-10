import React from 'react'
import { Form, Input } from 'antd'
import ResourceFormModal from '~/components/ResourceFormModal'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { PublicKey } from '~/modules/admin/modules/client/core/publicKeys'

interface Props {
  close(): void
}

const { I18n } = window

export const PublicKeyAddModal: React.FC<Props> = ({ close }) => {
  const { resource } = useResourceContext<PublicKey>()

  return (
    <ResourceFormModal
      resourceName="public_keys"
      readableResourceName={I18n.t('admin.public_key')}
      showSuccessMessages
      close={close}
      scrollToFirstError
      modalProps={{ width: 620 }}
      request={{ createResource: resource.createResource }}
    >
      {() => (
        <>
          <Form.Item
            name="publicKey"
            label={I18n.t('admin.public_key_pem')}
            rules={[{ required: true }]}
          >
            <Input.TextArea
              rows={8}
              placeholder={I18n.t('admin.public_key_paste_placeholder')}
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>
          <Form.Item
            name="description"
            label={I18n.t('shared.description')}
          >
            <Input />
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}
