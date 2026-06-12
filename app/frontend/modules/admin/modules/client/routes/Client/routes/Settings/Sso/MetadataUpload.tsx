import React, { useState } from 'react'
import {
  Upload, App, Typography, Spin,
} from 'antd'
import { CloudUploadOutlined, CheckCircleOutlined, CloseCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

const { I18n } = window
const { Text } = Typography
const { Dragger } = Upload

const MAX_FILE_SIZE_MB = 1
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

type ParsedMetadata = {
  idpEntityId: string | null
  idpSsoUrl: string | null
  idpSloUrl: string | null
  idpCert: string | null
  certificateExpiry: string | null
}

type Status = 'idle' | 'parsing' | 'success' | 'error'

type Props = {
  onParsed: (fields: ParsedMetadata) => void
  parseMetadata: (body: Record<string, unknown>) => Promise<unknown>
  isLoading: boolean
}

export const MetadataUpload: React.FC<Props> = ({ onParsed, parseMetadata, isLoading }) => {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const { message } = App.useApp()

  const readAndParse = (file: File) => {
    setStatus('parsing')
    setErrorMessage('')

    const reader = new FileReader()
    reader.onload = (e) => {
      const xml = e.target?.result as string

      parseMetadata({ xml })
        .then((result) => {
          onParsed(result as ParsedMetadata)
          setStatus('success')
          message.success(I18n.t('admin.sso_settings_metadata_parse_success'))
        })
        .catch((err) => {
          const msg = err?.title || I18n.t('admin.sso_settings_metadata_parse_error')
          setErrorMessage(msg)
          setStatus('error')
        })
    }
    reader.readAsText(file)
  }

  const beforeUpload = (file: File) => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(I18n.t('admin.sso_settings_metadata_file_too_large'))
      setStatus('error')
      return Upload.LIST_IGNORE
    }
    readAndParse(file)
    return false
  }

  const draggerContent = () => {
    if (status === 'parsing' || isLoading) {
      return <Spin tip={I18n.t('admin.sso_settings_metadata_parsing')} />
    }
    if (status === 'success') {
      return (
        <>
          <p><CheckCircleOutlined style={{ fontSize: 32, color: '#52c41a' }} /></p>
          <p><Text type="success">{I18n.t('admin.sso_settings_metadata_parse_success')}</Text></p>
          <p><Text type="secondary">{I18n.t('admin.sso_settings_metadata_upload_again')}</Text></p>
        </>
      )
    }
    if (status === 'error') {
      return (
        <>
          <p><CloseCircleOutlined style={{ fontSize: 32, color: '#ff4d4f' }} /></p>
          <p><Text type="danger">{errorMessage}</Text></p>
          <p><Text type="secondary">{I18n.t('admin.sso_settings_metadata_upload_retry')}</Text></p>
        </>
      )
    }
    return (
      <>
        <p><CloudUploadOutlined style={{ fontSize: 32, color: '#8c8c8c' }} /></p>
        <p><Text strong>{I18n.t('admin.sso_settings_metadata_upload')}</Text></p>
        <p><Text type="secondary">{I18n.t('admin.sso_settings_metadata_upload_drag_hint')}</Text></p>
      </>
    )
  }

  return (
    <Dragger
      accept=".xml"
      maxCount={1}
      showUploadList={false}
      beforeUpload={beforeUpload}
      fileList={[]}
      disabled={status === 'parsing' || isLoading}
      style={{ padding: '8px 0' }}
    >
      {draggerContent()}
    </Dragger>
  )
}
