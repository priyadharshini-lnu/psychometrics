import React, { useState } from 'react'
import {
  Modal, Button, Alert, message,
} from 'antd'
import Event from 'interfaces/Event'
import { LoadingOutlined, CheckOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

const { I18n } = window

type Props = {
  campaignId: string,
  close(): void
  open: boolean
  loading: boolean
  importFactors(campaignId: string, body: FormData): Promise<{ response: void; }>
}

export const ImportFactorsForm: React.FC<Props> = ({
  campaignId, close, open, loading, importFactors,
}) => {
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState([])

  return (
    <Modal
      width={650}
      title={I18n.t('admin.scoring_import_factors')}
      open={open}
      onCancel={close}
      footer={[
        <Button key="back" onClick={close}>{I18n.t('shared.cancel')}</Button>,
        <Button
          key="submit"
          onClick={() => {
            if (!file) return
            const data = new FormData()
            data.append('file', file)
            importFactors(campaignId, data)
              .then(() => {
                message.info(I18n.t('admin.scoring_factors_imported_successfully'))
                close()
              })
              .catch(setErrors)
          }}
        >
          {loading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('shared.upload')}
        </Button>,
      ]}
    >
      <p>{I18n.t('campaign_assessment.modals.import_raw.body')}</p>
      {errors.length ? (
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
      <input
        type="file"
        accept=".xlsx, .xls, .csv"
        onChange={({ target: { files } }: Event<HTMLInputElement>) => setFile(files && files[0])}
      />
    </Modal>
  )
}
