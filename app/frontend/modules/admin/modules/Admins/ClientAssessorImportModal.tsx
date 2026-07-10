import React, { useState } from 'react'
import {
  Alert, Button, Form, Input, Modal, Typography,
} from 'antd'
import Event from 'interfaces/Event'
import {
  CheckOutlined, CloudDownloadOutlined, LoadingOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'

type Props = {
  open: boolean
  loading: boolean
  onClose: () => void
  onDownloadTemplate: () => void
  onSubmit: (file: File) => Promise<void>
}

const { I18n } = window

export const ClientAssessorImportModal: React.FC<Props> = ({
  open, loading, onClose, onDownloadTemplate, onSubmit,
}) => {
  const [form] = Form.useForm()
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<string[]>([])

  const handleClose = () => {
    form.resetFields()
    setFile(null)
    setErrors([])
    onClose()
  }

  const handleUpload = async () => {
    if (!file) return

    setErrors([])

    try {
      await onSubmit(file)
      handleClose()
    } catch (error) {
      const normalizedErrors = Array.isArray(error) ? error : [I18n.t('shared.something_went_wrong')]
      setErrors(normalizedErrors)
    }
  }

  return (
    <Modal
      width={700}
      title={I18n.t('admin.assessor_modals_import_title')}
      open={open}
      onCancel={handleClose}
      footer={[
        <Button key="cancel" onClick={handleClose} disabled={loading}>
          {I18n.t('shared.cancel')}
        </Button>,
        <Button key="submit" type="primary" disabled={!file} onClick={() => form.submit()}>
          {loading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('shared.save')}
        </Button>,
      ]}
    >
      <Typography.Paragraph>
        {I18n.t('admin.client_assessor_import_description')}
      </Typography.Paragraph>
      <Button type="link" icon={<CloudDownloadOutlined />} onClick={onDownloadTemplate} className="mbm p-0">
        {I18n.t('admin.download_assessor_email_template')}
      </Button>
      {errors.length > 0 ? (
        <Alert
          message={false}
          description={errors.map((error, index) => <div key={index}>{error}</div>)}
          type="error"
          className="mbm"
        />
      ) : null}
      <Form form={form} onFinish={handleUpload}>
        <Form.Item name="importData" rules={[{ required: true }]}>
          <Input
            type="file"
            accept=".csv"
            onChange={({ target: { files } }: Event<HTMLInputElement>) => setFile(files && files[0])}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
