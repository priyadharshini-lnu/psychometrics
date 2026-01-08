import React, { useState } from 'react'
import {
  Upload, Modal, Button, message,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { CheckOutlined, LoadingOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { uploadFile } from '~/modules/admin/modules/campaigns/core/userReports'

const { I18n } = window

interface OwnProps {
  close(): void
  parentId: number
  campaignId: number
}

const connector = connect(null, { uploadFile })

export type PropsFromRedux = ConnectedProps<typeof connector>

export type Props = OwnProps & PropsFromRedux

const UploadFileModal: React.FC<Props> = ({
  close, parentId, campaignId, uploadFile,
}) => {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (info) => {
    if (info.fileList.length) {
      setFile(info.fileList[0].originFileObj)
    } else {
      setFile(null)
    }
  }

  const handleSubmit = () => {
    if (!file) return

    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)

    uploadFile(campaignId, parentId, formData)
      .then(() => {
        message.success(I18n.t('user_reports.modals.upload_file.success'))
      })
      .finally(() => {
        setLoading(false)
        close()
      })
  }

  return (
    <Modal
      width={650}
      title={I18n.t('common.actions.upload_file')}
      open
      onCancel={close}
      footer={[
        <Button key="back" onClick={close}>{I18n.t('common.actions.cancel')}</Button>,
        <Button
          type="primary"
          key="submit"
          disabled={!file || loading}
          onClick={handleSubmit}
        >
          {loading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('user_reports.modals.upload_file.upload')}
        </Button>,
      ]}
    >
      <Upload
        accept=".pdf"
        beforeUpload={() => false}
        onChange={handleFileChange}
        maxCount={1}
      >
        <button type="button">
          {I18n.t('user_reports.modals.upload_file.choose_file')}
        </button>
      </Upload>
    </Modal>
  )
}

export default connector(UploadFileModal)
