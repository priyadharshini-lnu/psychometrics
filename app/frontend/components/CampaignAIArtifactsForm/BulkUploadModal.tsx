import {
  Alert,
  Button, message, Modal, Upload,
} from 'antd'
import type { UploadFile } from 'antd/es/upload'
import { connect, ConnectedProps } from 'react-redux'
import { useCallback, useState } from 'react'
import { CheckOutlined, LoadingOutlined, UploadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import styles from './CampaignAIArtifactsForm.less'
import AppStore from '~/modules/reports/store/AppStore'
import { importCampaignAiArtifacts } from '~/modules/admin/modules/campaigns/core/campaignAiArtifacts'
import { CampaignAIArtifact } from './types'

const { I18n } = window

const connector = connect(
  null, {
    importCampaignAiArtifacts,
  },
)

interface props extends ConnectedProps<typeof connector> {
  close(): void
  open: boolean
  handleBulkUpload: (AiArtifacts: CampaignAIArtifact[]) => void
}

const BulkUploadModal: React.FC<props> = ({
  close, open, handleBulkUpload, importCampaignAiArtifacts,
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
      title={I18n.t('admin.bulk_upload_ai_artifacts')}
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
              message.info(I18n.t('administration.no_file_selected'))
              return
            }
            const data = new FormData()
            data.append('file', files[0].originFileObj as Blob, files[0].name)
            const reportId = (AppStore.report as unknown as { id: number }).id
            data.append('report_id', reportId.toString())
            setLoading(true)
            importCampaignAiArtifacts(reportId, data)
              .then((res) => {
                handleBulkUpload(res.response)
                message.info(I18n.t('admin.upload_success'))
                close()
              })
              .catch((err) => {
                setErrors(err)
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
        <p>
          <a target="_blank" href="/example_csv/ai-artifacts-sample.csv">
            {I18n.t('administration.reports.bulk_upload.sample_file')}
          </a>
        </p>
        <Upload.Dragger
          accept=".csv"
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
