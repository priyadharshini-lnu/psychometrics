/* eslint-disable react/no-danger */
import React, { useState } from 'react'
import {
  Modal, Upload, Button, message,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import axios from 'axios'
import { DirectUpload } from '@rails/activestorage'

import { CheckOutlined, LoadingOutlined, CloudDownloadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

const { I18n, $ } = window

interface OwnProps {
  close(): void
  campaignReportId: number
  campaignId: number
}

const connector = connect(null, { })

export type PropsFromRedux = ConnectedProps<typeof connector>

export type Props = OwnProps & PropsFromRedux

const UploadBulkAssetsModal: React.FC<Props> = ({
  close, campaignReportId, campaignId,
}) => {
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [zipFile, setZipFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const MAX_FILE_SIZE_MB = 250
  const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024

  const handleCsvChange = (info) => {
    if (info.fileList.length) {
      const file = info.fileList[0].originFileObj
      if (file && file.size > MAX_FILE_SIZE) {
        message.error(`CSV file size should not exceed ${MAX_FILE_SIZE_MB} MB!`)
        setCsvFile(null)
      } else {
        setCsvFile(file)
      }
    } else {
      setCsvFile(null)
    }
  }

  const handleZipChange = (info) => {
    if (info.fileList.length) {
      const file = info.fileList[0].originFileObj
      if (file && file.size > MAX_FILE_SIZE) {
        message.error(`ZIP file size should not exceed ${MAX_FILE_SIZE_MB} MB!`)
        setZipFile(null)
      } else {
        setZipFile(file)
      }
    } else {
      setZipFile(null)
    }
  }

  const handleSubmit = async () => {
    if (!csvFile || !zipFile) return
    setLoading(true)
    try {
      // Upload CSV
      const csvUpload = new Promise((resolve, reject) => {
        const upload = new DirectUpload(
          csvFile,
          `/administration/new_campaigns/${campaignId}/reports/${campaignReportId}`
          + '/get_bulk_assets_csv_presigned_upload_url',
        )
        upload.create((error, blob) => {
          if (error) reject(error)
          else resolve(blob)
        })
      })
      // Upload ZIP
      const zipUpload = new Promise((resolve, reject) => {
        const upload = new DirectUpload(
          zipFile,
          `/administration/new_campaigns/${campaignId}/reports/${campaignReportId}`
          + '/get_bulk_assets_zip_presigned_upload_url',
        )
        upload.create((error, blob) => {
          if (error) reject(error)
          else resolve(blob)
        })
      })
      const [csvBlob, zipBlob] = await Promise.all([csvUpload, zipUpload])
      await onUploadSuccess(csvBlob, zipBlob)
      message.success('Files uploaded successfully!')
      close()
    } catch (error) {
      message.error('File upload failed!')
    } finally {
      setLoading(false)
    }
  }

  const onUploadSuccess = async (csvBlob, zipBlob) => {
    await axios.put(
      `/administration/new_campaigns/${campaignId}/reports/${campaignReportId}`
      + '/attach_bulk_asset_csv_and_zip',
      {
        campaign_report_id: campaignReportId,
        csv_signed_id: csvBlob.signed_id,
        zip_signed_id: zipBlob.signed_id,
      },
      {
        headers: { 'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content') },
      },
    )
  }

  return (
    <Modal
      width={650}
      title={I18n.t('admin.bulk_assets_modal_title')}
      open
      onCancel={close}
      footer={[
        <Button key="cancel" onClick={close}>
          {I18n.t('common.actions.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          disabled={!csvFile || !zipFile || loading}
          icon={loading ? <LoadingOutlined /> : <CheckOutlined />}
        >
          {I18n.t('common.actions.upload')}
        </Button>,
      ]}
      mask={{ closable: false }}
    >
      <div style={{ marginBottom: 16 }}>
        <p
          dangerouslySetInnerHTML={{
            __html: I18n.t(
              'admin.bulk_assets_modal_subtitle',
              { max_file_size: MAX_FILE_SIZE_MB },
            ),
          }}
        />
      </div>
      <div className="mbl" style={{ fontSize: '16px' }}>
        <a href="/example_csv/bulk_assets_upload_example.csv" target="_blank">
          <CloudDownloadOutlined />
          <span className="mls">
            {I18n.t('admin.download_bulk_asset_download_example_csv')}
          </span>
        </a>
      </div>
      <div style={{ marginBottom: 16 }}>
        <Upload
          accept=".csv"
          beforeUpload={(file) => {
            const isCsv = file.type === 'text/csv' || file.name.endsWith('.csv')
            if (!isCsv) {
              message.error(
                I18n.t('admin.bulk_assets_modal_not_csv_file_error'),
              )
              return Upload.LIST_IGNORE
            }
            return false
          }}
          onChange={handleCsvChange}
          maxCount={1}
        >
          <Button>
            {I18n.t('admin.bulk_assets_modal_choose_csv')}
          </Button>
        </Upload>
      </div>
      <div>
        <Upload
          accept=".zip"
          beforeUpload={(file) => {
            const isZip = file.type === 'application/zip' || file.name.endsWith('.zip')
            if (!isZip) {
              message.error(
                I18n.t('admin.bulk_assets_modal_not_zip_file_error'),
              )
              return Upload.LIST_IGNORE
            }
            return false
          }}
          onChange={handleZipChange}
          maxCount={1}
        >
          <Button>
            {I18n.t('admin.bulk_assets_modal_choose_zip')}
          </Button>
        </Upload>
      </div>
    </Modal>
  )
}

export default connector(UploadBulkAssetsModal)
