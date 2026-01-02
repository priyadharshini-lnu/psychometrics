import React, { useRef } from 'react'
import {
  Modal, Button, Space, Alert, Form, Input, InputRef,
} from 'antd'
import { CloudDownloadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

const { I18n } = window

interface SubjectBulkImportModalProps {
  open: boolean
  onCancel: () => void
  onUpload: (file: File) => void
  importInProgress: boolean
  csvErrors: {
    message?: string
  }[]
}

export const SubjectBulkImportModal: React.FC<SubjectBulkImportModalProps> = ({
  open,
  onCancel,
  onUpload,
  importInProgress,
  csvErrors,
}) => {
  const ref = useRef<InputRef>(null)
  const [form] = Form.useForm()

  const handleUpload = () => {
    const files = ref.current?.input?.files
    if (files && files[0]) {
      onUpload(files[0])
    } else {
      form.validateFields(['file'])
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  return (
    <Modal
      title={I18n.t('admin.import_title')}
      open={open}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          {I18n.t('common.actions.cancel')}
        </Button>,
        <Button
          key="upload"
          type="primary"
          loading={importInProgress}
          disabled={importInProgress}
          onClick={handleUpload}
        >
          {I18n.t('admin.import_upload')}
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          {I18n.t('admin.import_description')}
        </div>

        <div>
          <Space>
            <CloudDownloadOutlined />
            {I18n.t('admin.import_sample_file_label')}
            <a
              href="/example_csv/workshop_subject_import.csv"
              target="_blank"
              rel="noopener noreferrer"
            >
              {I18n.t('admin.import_download_sample')}
            </a>
          </Space>
        </div>

        <Form form={form}>
          <Form.Item
            name="file"
            rules={[
              {
                required: true,
                message: I18n.t('admin.import_file_required'),
              },
            ]}
          >
            <Input
              ref={ref}
              type="file"
              accept=".csv"
            />
          </Form.Item>
        </Form>

        {csvErrors.length > 0 && (
          <Alert
            type="error"
            message={I18n.t('admin.import_errors_title')}
            description={csvErrors.map((error, index) => (
              <div key={index}>
                {error.message}
              </div>
            ))}
          />
        )}
      </Space>
    </Modal>
  )
}
