import React, { useState } from 'react'
import _ from 'lodash'
import {
  Modal, Button, Alert, message,
} from 'antd'
import Event from 'interfaces/Event'
import { LoadingOutlined, CheckOutlined } from '@ant-design/icons'

const { I18n } = window

interface Props {
  close(): void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  importRawResults(campaignId: number, data: any): Promise<any>
  campaignId: number
  loading: boolean
}

const ImportRawModal: React.FC<Props> = ({
  close, importRawResults, campaignId, loading,
}) => {
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState([])

  return (
    <Modal
      width={650}
      title={I18n.t('campaign_assessment.modals.import_raw.title')}
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
            importRawResults(campaignId, data)
              .then(() => {
                message.info(I18n.t('campaign_assessment.modals.import_raw.success_msg'))
                close()
              })
              .catch(setErrors)
          }}
        >
          {loading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('campaign_assessment.modals.import_raw.upload')}
        </Button>,
      ]}
    >
      <p>{I18n.t('campaign_assessment.modals.import_raw.body')}</p>
      {errors?.length ? (
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

export default ImportRawModal
