import React, { useState } from 'react'
import { Upload, Modal, Button } from 'antd'
import { CheckOutlined, LoadingOutlined } from '@ant-design/icons'
import { connect, ConnectedProps } from 'react-redux'
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
  const formData = new FormData()
  const [loading, setLoading] = useState(false)

  const setFormData = (file) => {
    formData.append('file', file as File, file.name)
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
          key="submit"
          disabled={loading}
          onClick={() => {
            setLoading(true)
            uploadFile(campaignId, parentId, formData).finally(() => {
              setLoading(false)
              close()
            })
          }}
        >
          {loading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('user_reports.modals.upload_file.upload')}
        </Button>,
      ]}
    >
      <Upload
        accept=".pdf"
        beforeUpload={() => false}
        onChange={(info) => {
          setFormData(info.file)
        }}
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
