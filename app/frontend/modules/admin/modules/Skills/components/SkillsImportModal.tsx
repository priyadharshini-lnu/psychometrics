import React, { useState, useEffect, useRef } from 'react'
import ApiAction from 'interfaces/ApiAction'
import { LoadingOutlined, CheckOutlined, CloudDownloadOutlined } from '@ant-design/icons'
import {
  Button, Modal, Alert, Form, Input, Switch,
} from 'antd'
import { useParams } from 'react-router'
import Event from 'interfaces/Event'
import {
  OwnerAndProjectDropdown,
  useClientsAndProjectsResource,
} from '~/components/OwnerAndProjectDropdown'

const { I18n } = window

interface OwnProps {
  close(): void,
  handleImport: (data: FormData,
    projectId:number, successCallback: ()=>void, failureCallback: (error)=>void) => ApiAction<void>,
  csvFilePath: string,
  title: string,
  allowGlobalImport: boolean,
}

export const SkillsImportModal: React.FC<OwnProps> = ({
  close,
  handleImport,
  csvFilePath,
  title,
  allowGlobalImport,
}) => {
  const [form] = Form.useForm()
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(false)

  const formRef = useRef<{ resetForm:() => void,
      setForm: (values: {projectId:string, ownerId: string}) => void }>(null)

  const { projectId: projectIdParam } = useParams()
  const [projectId, setProjectId] = useState<string | null>(projectIdParam || null)
  const [ownerId, setOwnerId] = useState<string | null>()

  const globalImportSwitch = Form.useWatch('globalImportSwitch', form)

  useEffect(() => {
    handleOwnersSearch()
  }, [])

  useEffect(() => {
    form.resetFields(['ownerId'])
  }, [globalImportSwitch])


  useEffect(() => {
    if (ownerId) {
      handleProjectsSearch()
    }
  }, [ownerId])

  const {
    owners,
    projects,
    handleProjectsSearch,
    handleOwnersSearch,
  } = useClientsAndProjectsResource(ownerId || '')

  const handleUpload = () => {
    if (projectId) {
      if (!file) return

      const data = new FormData()
      data.append('file', file)
      setLoading(true)

      handleImport(data, parseInt(projectId, 10), () => {
        form.resetFields()
        close()
        setLoading(false)
      }, (error) => {
        setErrors(error)
        setLoading(false)
      })
    }
  }

  const handleValuesChange = (changedValues: Record<string, string>) => {
    if (changedValues?.ownerId) {
      setOwnerId(changedValues?.ownerId)
      setProjectId(null)
    }

    if (changedValues?.projectId) {
      setProjectId(changedValues?.projectId)
    }
  }

  const renderProjectSelector = () => {
    if (globalImportSwitch) {
      return null
    }
    return (
      <>
        <OwnerAndProjectDropdown
          ref={formRef}
          projectOpts={projects}
          ownerOpts={owners}
          onProjectsSearch={handleProjectsSearch}
          onOwnersSearch={handleOwnersSearch}
          onValuesChange={handleValuesChange}
        />
      </>
    )
  }

  const renderScopeSelector = () => {
    if (!allowGlobalImport) { return null }
    return (
      <>
        <Form.Item
          name="globalImportSwitch"
          label={I18n.t('common.text.global_import')}
        >
          <Switch />
        </Form.Item>
        {renderProjectSelector()}
      </>
    )
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
          }
          }
        >
          {loading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('common.actions.update')}
        </Button>,
      ]}
    >
      <div className="mbl" style={{ fontSize: '16px' }}>
        <a href={csvFilePath}>
          <CloudDownloadOutlined />
          <span className="mls">
            {I18n.t('administration.skills.import.download_example_csv')}
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
        {!projectIdParam && renderScopeSelector()}
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
