/* eslint-disable max-len */
import React, { useState } from 'react'
import { useParams } from 'react-router'

import {
  Button, Modal, Alert, Form, Input,
} from 'antd'

import Event from 'interfaces/Event'
import ApiAction from 'interfaces/ApiAction'
import { LoadingOutlined, CheckOutlined, CloudDownloadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

const { I18n } = window

interface OwnProps {
  close(): void
  handleImport: (data: FormData, projectId:number, successCallback: ()=>void, failureCallback: (error)=>void) => ApiAction<void>,
  title: string,
}

export const ImportModal: React.FC<OwnProps> = ({
  close,
  handleImport,
  title,
}) => {
  const params = useParams()
  const [form] = Form.useForm()
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(false)

  const handleUpload = () => {
    if (!file) return

    const data = new FormData()
    data.append('file', file)
    setLoading(true)
    handleImport(data, params.projectId || projectId, () => {
      form.resetFields()
      close()
      setLoading(false)
    }, (error) => {
      setErrors(error)
      setLoading(false)
    })
  }

  const projectId = Form.useWatch('projectId', form)

  return (
    <Modal
      width={700}
      title={title}
      open
      onCancel={close}
      footer={[
        <Button
          key="back"
          onClick={close}
        >
          {I18n.t('shared.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          disabled={!file}
          onClick={() => {
            form.submit()
          }}
        >
          {loading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('shared.update')}
        </Button>,
      ]}
    >

      <div className="mbl" style={{ fontSize: '16px' }}>
        <Button
          href="/example_csv/import_interview_questions_sample.csv"
          target="_blank"
          type="link"
          download="import_interview_questions_sample.csv"
          icon={<CloudDownloadOutlined />}
        >
          {I18n.t('admin.common_download_sample_file')}
        </Button>
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
