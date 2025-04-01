/* eslint-disable max-len */
import React, { useState, useEffect } from 'react'
import { LoadingOutlined, CheckOutlined } from '@ant-design/icons'
import { debounce } from 'lodash'
import { Client } from 'modules/admin/modules/client/core/clients'

import {
  Button, Modal, Alert, Form, Input, Select, Switch,
} from 'antd'

import Event from 'interfaces/Event'
import ApiAction from 'interfaces/ApiAction'
import { Project } from '~/modules/admin/modules/client/core/projects'
import DownloadSampleFile from '~/modules/admin/components/DownloadSampleFile'

import { useResources } from '~/hooks/useResources'

const { Option } = Select

const { I18n } = window

interface OwnProps {
  close(): void
  handleImport: (data: FormData, projectId:number, successCallback: ()=>void, failureCallback: (error)=>void) => ApiAction<void>,
  csvData: string,
  title: string,
  allowGlobalImport: boolean
}

export const DevelopmentActionsImportModal: React.FC<OwnProps> = ({
  close,
  handleImport,
  csvData, title,
  allowGlobalImport,
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
    handleImport(data, projectId, () => {
      form.resetFields()
      close()
      setLoading(false)
    }, (error) => {
      setErrors(error)
      setLoading(false)
    })
  }

  const {
    data: owners, fetch: fetchOwners,
  } = useResources<Client>('clients')

  const ownerOption = Form.useWatch('ownerId', form)

  const projectId = Form.useWatch('projectId', form)

  const globalImportSwitch = Form.useWatch('globalImportSwitch', form)

  const fetchOwnersByValue = (value: string) => fetchOwners({
    apiConfig: {
      filter: {
        filterable_fields: value,
      },
    },
  })

  useEffect(() => {
    form.resetFields(['ownerId'])
  }, [globalImportSwitch])

  const searchAvailableOwners = debounce((value) => {
    fetchOwnersByValue(value)
  }, 50)


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
        <DownloadSampleFile
          fileData={csvData}
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
        {allowGlobalImport && (
          <>

            <Form.Item
              name="globalImportSwitch"
              label="Is Global Import?"
            >
              <Switch />
            </Form.Item>
            {!globalImportSwitch && (
              <>
                <Form.Item
                  name="ownerId"
                  label={I18n.t('common.column.owner')}
                  rules={[{ required: true }]}
                >
                  <Select
                    showSearch
                    filterOption={false}
                    placeholder={
              I18n.t('administration.development_actions.form.owner_placeholder')
            }
                    onSearch={searchAvailableOwners}
                  >
                    {
              owners.map(({ id, name }) => (
                <Option key={id} value={id}>{name}</Option>
              ))
            }
                  </Select>
                </Form.Item>
                <ProjectDropdown form={form} owner={ownerOption} />
              </>
            )}

          </>
        )}
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

const ProjectDropdown = ({ form, owner }) => {
  const {
    data: projects, fetch: fetchProjects, setData: setProjects,
  } = useResources<Project>('projects', { basePath: `clients/${owner}` })

  const handleProjectSearch = (value: string) => {
    fetchProjects({
      apiConfig: {
        filter: { filterable_fields: value },
        fields: { clients: ['name'] },
      },
    })
  }

  useEffect(() => {
    setProjects([])
    form.resetFields(['projectId'])
    if (owner) fetchProjects()
  }, [owner])


  return (
    <Form.Item
      name="projectId"
      label={I18n.t('common.column.project')}
      rules={[{ required: true }]}
    >
      <Select
        disabled={!owner}
        showSearch
        filterOption={false}
        key={owner}
        onSearch={handleProjectSearch}
        options={projects.map(p => ({
          value: p.id,
          label: p.name,
        }))}
        placeholder={I18n.t('administration.development_actions.form.project_placeholder')}
      />
    </Form.Item>
  )
}
