import React, { useState } from 'react'
import ApiAction from 'interfaces/ApiAction'
import {
  Button, Modal, Alert, Form, Input,
} from 'antd'
import { useParams } from 'react-router'
import Event from 'interfaces/Event'
import { LoadingOutlined, CheckOutlined, CloudDownloadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

const { I18n } = window

interface OwnProps {
  close(): void
  handleImport: (data: FormData, projectId:number | null, successCallback: ()=>
      void, failureCallback: (error)=>void) => ApiAction<void>,
  csvFilePath: string,
  title: string,
}

export const DevelopmentActionsImportModal: React.FC<OwnProps> = ({
  close,
  handleImport,
  csvFilePath,
  title,
}) => {
  const [form] = Form.useForm()
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(false)
  const { projectId } = useParams()
  const handleUpload = () => {
    if (!file) return

    const data = new FormData()
    data.append('file', file)
    setLoading(true)

    handleImport(data, projectId ? parseInt(projectId, 10) : null, () => {
      form.resetFields()
      close()
      setLoading(false)
    }, (error) => {
      setErrors(error)
      setLoading(false)
    })
  }

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
          }
          }
        >
          {loading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('shared.update')}
        </Button>,
      ]}
    >
      <div className="mbl" style={{ fontSize: '16px' }}>
        <a href={csvFilePath}>
          <CloudDownloadOutlined />
          <span className="mls">
            {I18n.t('admin.development_actions_import_download_example_csv')}
          </span>
        </a>
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
