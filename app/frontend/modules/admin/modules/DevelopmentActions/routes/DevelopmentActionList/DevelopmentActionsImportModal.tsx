/* eslint-disable max-len */
import React, { useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'


import { LoadingOutlined, CheckOutlined } from '@ant-design/icons'
import {
  Button, Modal, message, Alert, Form, Input,
} from 'antd'
import Event from 'interfaces/Event'
import { importDevelopmentActions } from '~/modules/admin/modules/DevelopmentActions/core/development_actions'
import DownloadSampleFile from '~/modules/admin/components/DownloadSampleFile'

const CSVData = `ID,SkillID,Name,Description,Type,ProjectID,CourseURL,CourseStartDate,CourseEndDate,CourseImage
1,11000000001,Leadership,About Leadership qualities,structured_learning,275,www.google.com,2025-01-01,2025-12-31,https://picsum.photos/200`

const connecter = connect(() => ({
}),
{
  importDevelopmentActions,
})
export type PropsFromRedux = ConnectedProps<typeof connecter>

const { I18n } = window

interface OwnProps extends PropsFromRedux {
  close(): void
}

const ImportModalComponent: React.FC<OwnProps> = ({
  close,
  importDevelopmentActions,
}) => {
  const [form] = Form.useForm()
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(false)

  const handleUpload = () => {
    if (!file) return

    const data = new FormData()
    data.append('file', file)
    setLoading(true)

    importDevelopmentActions(data)
      .then(() => {
        message.info(I18n.t('administration.development_actions.import.success_msg'))
        close()
        form.resetFields()
      }).catch(setErrors).finally(() => {
        setLoading(false)
      })
  }


  return (
    <Modal
      width={700}
      title={I18n.t('administration.development_actions.import.title')}
      open
      onCancel={close}
      footer={[
        <Button
          key="back"
          onClick={close}
        >
          {I18n.t('common.actions.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          disabled={!file}
          onClick={() => {
            form.submit()
          }
          }
        >
          {loading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('common.actions.update')}
        </Button>,
      ]}
    >
      <div className="mbl" style={{ fontSize: '16px' }}>
        <DownloadSampleFile
          fileData={CSVData}
          buttonText={I18n.t('administration.development_actions.import.download_example_csv')}
        />
      </div>
      {errors.length ? (
        <Alert
          message={false}
          description={errors.map((e, i) => <div key={i}>{e}</div>)}
          type="error"
          className="mbm"
        />
      ) : null}
      <Form
        name="basic"
        form={form}
        onFinish={handleUpload}
      >
        <Form.Item name="importData">
          <Input
            type="file"
            accept=".csv"
            onChange={({ target: { files } }: Event<HTMLInputElement>) => setFile(files && files[0])}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}


export const DevelopmentActionsImportModal = connecter(ImportModalComponent)
