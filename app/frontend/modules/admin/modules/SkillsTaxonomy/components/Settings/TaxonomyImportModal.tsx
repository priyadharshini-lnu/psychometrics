import React, { useState } from 'react'
import ApiAction from 'interfaces/ApiAction'
import {
  Button, Modal, Alert, Form, Input,
} from 'antd'
import { useParams } from 'react-router'
import Event from 'interfaces/Event'
import { CheckOutlined, LoadingOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

const { I18n } = window

interface OwnProps {
  close(): void,
  handleImport: (data: FormData,
    projectId:number | null, successCallback: ()=>void, failureCallback: (error)=>void) => ApiAction<void>,
  title: string,
}

export const TaxonomyImportModal: React.FC<OwnProps> = ({
  close,
  handleImport,
  title,
}) => {
  const [form] = Form.useForm()
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(false)

  const { projectId: projectIdParam } = useParams()

  const handleUpload = () => {
    if (!file) return

    const data = new FormData()
    data.append('file', file)
    setLoading(true)

    handleImport(data, projectIdParam ? Number(projectIdParam) : null, () => {
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
          {I18n.t('common.actions.cancel')}
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
          {I18n.t('common.actions.update')}
        </Button>,
      ]}
    >
      <div className="mbl" style={{ fontSize: '16px' }}>
        <a target="_blank" href="/example_csv/import_taxonomy_sample_file.xlsx">
          {I18n.t('administration.taxonomy.import.download_example_file')}
        </a>
      </div>
      {errors?.length ? (
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
            accept=".xls,.xlsx"
            onChange={({ target: { files } }: Event<HTMLInputElement>) => setFile(files && files[0])}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
