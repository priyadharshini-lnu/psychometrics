import React, { useState } from 'react'
import {
  Form, Input, Modal, Button, Alert, Space, App, Typography,
} from 'antd'
import { CopyOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { useResources } from '~/hooks/useResources'
import { BaseMeta } from '~/hooks/useResources/interfaces'
import { PublicKey, PublicKeyTR, GenerateKeyPairResponseTR } from '~/modules/admin/modules/client/core/publicKeys'

interface Props {
  applicationId: string
  close(): void
}

const { I18n } = window

export const PublicKeyGenerateModal: React.FC<Props> = ({ applicationId, close }) => {
  const [form] = Form.useForm<{ description: string }>()
  const [privateKey, setPrivateKey] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const { message } = App.useApp()

  const { collectionAction } = useResources<PublicKey, BaseMeta>('public_keys', {
    responseType: PublicKeyTR,
    basePath: `applications/${applicationId}`,
  })

  const handleGenerate = async () => {
    const values = await form.validateFields()
    setIsGenerating(true)
    try {
      const response = await collectionAction({
        action: 'generate_key_pair',
        method: 'post',
        body: { description: values.description },
        responseType: GenerateKeyPairResponseTR,
      }) as { privateKey: string }
      setPrivateKey(response.privateKey)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyPrivateKey = async () => {
    if (!privateKey) return
    await navigator.clipboard.writeText(privateKey)
    message.success(I18n.t('admin.public_key_private_key_copied'))
  }

  const handleClose = () => {
    message.success(I18n.t('admin.public_key_created'))
    close()
  }

  return (
    <Modal
      open
      title={I18n.t('admin.public_key_generate')}
      onCancel={close}
      footer={null}
      width={620}
    >
      {!privateKey ? (
        <Space orientation="vertical" style={{ width: '100%' }}>
          <Alert
            type="info"
            title={I18n.t('admin.public_key_generate_info')}
            showIcon
          />
          <Form form={form} layout="vertical">
            <Form.Item
              name="description"
              label={I18n.t('shared.description')}
            >
              <Input />
            </Form.Item>
          </Form>
          <Space>
            <Button
              type="primary"
              loading={isGenerating}
              onClick={handleGenerate}
            >
              {I18n.t('admin.public_key_generate_button')}
            </Button>
            <Button onClick={close}>
              {I18n.t('shared.cancel')}
            </Button>
          </Space>
        </Space>
      ) : (
        <Space orientation="vertical" style={{ width: '100%' }}>
          <Alert
            type="warning"
            title={I18n.t('admin.public_key_private_key_warning')}
            showIcon
          />
          <Typography.Text strong>{I18n.t('admin.public_key_private_key_label')}</Typography.Text>
          <Input.TextArea
            value={privateKey}
            readOnly
            autoSize={{ minRows: 8, maxRows: 12 }}
            style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
          />
          <Button icon={<CopyOutlined />} onClick={handleCopyPrivateKey} block>
            {I18n.t('admin.public_key_copy_private_key')}
          </Button>
          <Button type="primary" onClick={handleClose} block>
            {I18n.t('shared.close')}
          </Button>
        </Space>
      )}
    </Modal>
  )
}
