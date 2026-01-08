import React, { useState } from 'react'
import _ from 'lodash'
import {
  Modal, Button, Alert, message,
} from 'antd'
import Event from 'interfaces/Event'
import { LoadingOutlined, CheckOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

const { I18n } = window

interface Props {
  close(): void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  importScoringResults(campaignId: number, assessmentId: number, data: any): Promise<any>
  campaignId: number
  campaignAssessmentId: number
  loading: boolean
}

const ImportScoringModal: React.FC<Props> = ({
  close, importScoringResults, campaignId, campaignAssessmentId, loading,
}) => {
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState([])

  return (
    <Modal
      width={650}
      title={I18n.t('campaign_assessment.modals.import_scoring.title')}
      open
      onCancel={close}
      footer={[
        <Button key="back" onClick={close}>{I18n.t('common.actions.cancel')}</Button>,
        <Button
          key="submit"
          onClick={() => {
            if (!file) return
            const data = new FormData()
            data.append('file', file)
            importScoringResults(campaignId, campaignAssessmentId, data)
              .then(() => {
                message.info(I18n.t('campaign_assessment.modals.import_scoring.success_msg'))
                close()
              })
              .catch(setErrors)
          }}
        >
          {loading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('campaign_assessment.modals.import_scoring.upload')}
        </Button>,
      ]}
    >
      <p>{I18n.t('campaign_assessment.modals.import_scoring.body')}</p>
      {errors.length ? (
        <Alert
          message={false}
          description={_.join(errors, '\n')}
          type="error"
          className="mbm"
        />
      ) : null}
      <input
        type="file"
        accept=".xlsx, .xls, .csv"
        onChange={({ target: { files } }: Event<HTMLInputElement>) => setFile(files && files[0])}
      />
    </Modal>
  )
}

export default ImportScoringModal
