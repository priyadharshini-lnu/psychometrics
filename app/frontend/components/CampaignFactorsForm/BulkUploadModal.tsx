import {
  Alert,
  Button, message, Modal, Upload,
} from 'antd'
import type { UploadFile } from 'antd/es/upload'
import { connect, ConnectedProps } from 'react-redux'
import { useCallback, useState } from 'react'
import { CheckOutlined, LoadingOutlined, UploadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import styles from './CampaignFactorsForm.less'
import { importCampaignFactors } from '~/modules/admin/modules/campaigns/core/campaignFactors'
import AppStore from '~/modules/reports/store/AppStore'

const { I18n } = window

const connector = connect(null, { importCampaignFactors })

interface props extends ConnectedProps<typeof connector> {
  close(): void
  open: boolean
  handleBulkUpload: (factors) => void
}

const BulkUploadModal: React.FC<props> = ({
  close, open, handleBulkUpload, importCampaignFactors,
}) => {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(false)

  const handleFileUpload = useCallback((event) => {
    setFiles(event.fileList)
  }, [])

  return (
    <Modal
      width={650}
      title={I18n.t('administration.reports.bulk_upload.title')}
      open={open}
      onCancel={close}
      footer={[
        <Button key="back" onClick={close}>{I18n.t('common.actions.cancel')}</Button>,
        <Button
          key="submit"
          type="primary"
          disabled={loading}
          onClick={() => {
            if (!files.length) {
              message.info(I18n.t('administration.reports.bulk_upload.no_file_selected'))
              return
            }
            const data = new FormData()
            const reportId = (AppStore.report as unknown as { id: number }).id
            data.append('report_id', reportId.toString())
            data.append('file', files[0].originFileObj as Blob, files[0].name)
            setLoading(true)
            importCampaignFactors(reportId, data)
              .then((res) => {
                handleBulkUpload(res.response)
                message.info(I18n.t('administration.reports.bulk_upload.upload_success'))
                close()
              })
              .catch((err) => {
                setErrors(err)
                message.error(I18n.t('common.errors.something_wrong'))
              })
              .finally(() => {
                setLoading(false)
              })
          }}
        >
          {loading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('common.actions.upload')}
        </Button>,
      ]}
    >
      <div className={styles.modalBody}>
        <Upload.Dragger
          accept=".xlsx, .xls"
          action=""
          multiple={false}
          beforeUpload={() => false}
          className={styles.fileInput}
          onChange={handleFileUpload}
          onRemove={() => setFiles([])}
          fileList={files}
        >
          <UploadOutlined />
          <p>{I18n.t('administration.reports.bulk_upload.choose_file')}</p>
        </Upload.Dragger>
        {errors?.length ? (
          <Alert
            message={false}
            description={(
              <div>
                {errors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
          )}
            type="error"
            className="mbm"
          />
        ) : null}
      </div>
    </Modal>
  )
}

export default connector(BulkUploadModal)
