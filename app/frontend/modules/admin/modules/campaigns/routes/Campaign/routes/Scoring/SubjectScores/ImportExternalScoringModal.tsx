import { useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Form, Modal, Button, Alert, Input, message,
} from 'antd'
import { useParams } from 'react-router-dom'
import Event from 'interfaces/Event'
import { LoadingOutlined, CheckOutlined, CloudDownloadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { importExternalCampaignScores } from '~/modules/admin/modules/campaigns/core/scoring'

const { I18n } = window

const connector = connect(null, {
  importExternalCampaignScores,
})

interface Props extends ConnectedProps<typeof connector>{
  close(): void
  open: boolean
}

const ImportExternalScoringModalComponent: React.FC<Props> = ({
  close, open, importExternalCampaignScores,
}) => {
  const [form] = Form.useForm()
  const { campaignId } = useParams() as { campaignId: string }
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState([])

  const parsedCampaignId = parseInt(campaignId, 10)

  const handleUpload = () => {
    if (!file) return

    const data = new FormData()
    data.append('file', file)
    setLoading(true)

    importExternalCampaignScores(campaignId, data)
      .then(() => {
        message.info(I18n.t('admin.import_success_msg'))
        close()
        form.resetFields()
      }).catch(setErrors).finally(() => {
        setLoading(false)
      })
  }

  const handleModalCancel = () => {
    setErrors([])
    form.resetFields()
    close()
  }

  return (
    <Modal
      width={700}
      title={I18n.t('admin.campaigns_external_scores_import_modal_title')}
      open={open}
      onCancel={handleModalCancel}
      footer={[
        <Button
          key="back"
          onClick={handleModalCancel}
        >
          {I18n.t('common.actions.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          disabled={!file}
          onClick={handleUpload}
        >
          {loading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('common.actions.upload')}
        </Button>,
      ]}
    >
      <>
        {errors && errors.length > 0 && (
          <div>
            <Alert message={<ul className="mb-0">{errors.map(error => <li>{error}</li>)}</ul>} type="error" />
          </div>
        )}
        <div className="mbl" style={{ fontSize: '16px' }}>
          <a
            href={
              // eslint-disable-next-line max-len
              `/api/v2/administration/campaigns/${parsedCampaignId}/campaign_user_scorings/import_external_scorings_sample_file`
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            <CloudDownloadOutlined />
            <span className="mls">{I18n.t('admin.download_example_csv')}</span>
          </a>
        </div>
        <Form name="basic" form={form}>
          <Form.Item name="file">
            <Input
              type="file"
              accept=".csv"
              onChange={({ target: { files } }: Event<HTMLInputElement>) => setFile(files && files[0])}
            />
          </Form.Item>
        </Form>
      </>
    </Modal>
  )
}


export const ImportExternalScoringModal = connector(ImportExternalScoringModalComponent)
