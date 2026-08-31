import React, { useState } from 'react'
import {
  Alert, Button, Form, Input, Modal, Typography, message,
} from 'antd'
import { useDispatch } from 'react-redux'
import Event from 'interfaces/Event'
import {
  CheckOutlined, CloudDownloadOutlined, LoadingOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import {
  exportCampaignTranslations,
  importCampaignTranslations,
} from '~/modules/admin/modules/campaigns/core/list'

const { I18n } = window
const { Paragraph, Title } = Typography

interface Props {
  close(): void
  projectId: number
}

const BulkImportCampaignTranslationsModal: React.FC<Props> = ({ close, projectId }) => {
  const dispatch = useDispatch()
  const [form] = Form.useForm()
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [isDownloading, setIsDownloading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const startTemplateDownload = async () => {
    try {
      setIsDownloading(true)
      setErrors([])
      await dispatch(exportCampaignTranslations(projectId))
      message.info({
        content: I18n.t('administration.campaigns.bulk_import_translations.template_started'),
      })
    } catch (error) {
      setErrors(error || [I18n.t('administration.campaigns.bulk_import_translations.errors.generic')])
    } finally {
      setIsDownloading(false)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    const data = new FormData()
    data.append('file', file)

    try {
      setIsUploading(true)
      setErrors([])
      await dispatch(importCampaignTranslations(projectId, data))
      message.info({
        content: I18n.t('administration.campaigns.bulk_import_translations.import_started'),
      })
      form.resetFields()
      close()
    } catch (error) {
      setErrors(error || [I18n.t('administration.campaigns.bulk_import_translations.errors.generic')])
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Modal
      width={760}
      title={I18n.t('administration.campaigns.bulk_import_translations.title')}
      open
      onCancel={close}
      footer={[
        <Button
          key="cancel"
          onClick={close}
        >
          {I18n.t('shared.cancel')}
        </Button>,
        <Button
          key="download"
          onClick={startTemplateDownload}
          disabled={isDownloading || isUploading}
        >
          {isDownloading ? <LoadingOutlined /> : <CloudDownloadOutlined />}
          {I18n.t('administration.campaigns.bulk_import_translations.download_template')}
        </Button>,
        <Button
          key="upload"
          type="primary"
          disabled={!file || isUploading || isDownloading}
          onClick={() => form.submit()}
        >
          {isUploading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('administration.campaigns.bulk_import_translations.upload_file')}
        </Button>,
      ]}
    >
      <Title level={5}>{I18n.t('administration.campaigns.bulk_import_translations.instructions_title')}</Title>
      <Paragraph>{I18n.t('administration.campaigns.bulk_import_translations.instructions_intro')}</Paragraph>

      {errors.length > 0 && (
        <Alert
          className="mbm"
          type="error"
          message={false}
          description={errors.map((error, index) => <div key={index}>{error}</div>)}
        />
      )}

      <Form form={form} onFinish={handleUpload}>
        <Form.Item name="file" label={I18n.t('administration.campaigns.bulk_import_translations.file_label')}>
          <Input
            type="file"
            accept=".csv,text/csv,application/csv"
            onChange={({ target: { files } }: Event<HTMLInputElement>) => setFile(files && files[0])}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default BulkImportCampaignTranslationsModal
