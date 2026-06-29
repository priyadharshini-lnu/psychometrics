import { useState } from 'react'
import {
  Modal, Button, Radio, Typography, App,
  Space,
} from 'antd'
import { useResources } from '~/hooks/useResources'

const { Paragraph, Text } = Typography
const { I18n } = window

export interface ConvertOrCopyTemplateModalProps {
  visible: boolean
  close: () => void
  campaignId: string,
  projectId: string,
}

export default function ConvertOrCopyTemplateModal ({
  visible,
  close,
  campaignId,
  projectId,
}: ConvertOrCopyTemplateModalProps) {
  const [mode, setMode] = useState<'convert' | 'copy'>('convert')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { message } = App.useApp()

  const {
    memberAction,
  } = useResources('threesixty_campaigns', {
    basePath: `projects/${projectId}`,
  })

  const handleConvertToTemplate = async () => {
    await memberAction({
      id: campaignId,
      method: 'post',
      action: 'convert_to_template',
    })
    message.success(I18n.t('admin.modal_convert_success'))
  }

  const handleCopyAsTemplate = async () => {
    await memberAction({
      id: campaignId,
      method: 'post',
      action: 'copy_as_template',
    })
    message.success(I18n.t('admin.modal_copy_success'))
  }

  const onConfirm = async (mode: 'convert' | 'copy') => {
    if (mode === 'convert') {
      await handleConvertToTemplate()
    } else {
      await handleCopyAsTemplate()
    }
  }


  const handleSubmit = async () => {
    setError(null)
    setIsSubmitting(true)
    try {
      await onConfirm(mode)
      close()
    } catch (err) {
      setError(err?.base?.[0]?.title || I18n.t('admin.modal_failed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      width={600}
      open={visible}
      onCancel={close}
      title={I18n.t('admin.modal_title')}
      footer={[
        <Button key="cancel" onClick={close}>
          {I18n.t('shared.cancel')}
        </Button>,
        <Button
          key="confirm"
          type="primary"
          onClick={handleSubmit}
          loading={isSubmitting}
        >
          {I18n.t('shared.confirm')}
        </Button>,
      ]}
    >
      <Space orientation="vertical" size="middle">
        <Paragraph>
          {I18n.t('admin.modal_description')}
        </Paragraph>
      </Space>

      <Radio.Group
        onChange={(e) => {
          setMode(e.target.value)
          setError(null)
        }}
        value={mode}
      >
        <Space orientation="vertical" size={8}>
          <Radio value="convert">
            <Text strong>
              {I18n.t('admin.modal_convert_option')}
            </Text>
          </Radio>
          <Radio value="copy">
            <Text strong>
              {I18n.t('admin.modal_copy_option')}
            </Text>
          </Radio>
        </Space>
      </Radio.Group>
      {error && (
        <Paragraph className="mt-5">
          <Text type="danger">{error}</Text>
        </Paragraph>
      )}
    </Modal>
  )
}
