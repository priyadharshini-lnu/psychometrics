import React, { useEffect } from 'react'
import { Client } from 'modules/admin/modules/client/core/clients'
import { debounce } from 'lodash'
import {
  Button, Modal, Form, Select,
} from 'antd'
import { Project } from '~/modules/admin/modules/client/core/projects'

import { useResources } from '~/hooks/useResources'

const { Option } = Select

const { I18n } = window

interface OwnProps {
  close(): void,
  handleExport: (projectId:number) => void
  title: string
}

export const DevelopmentActionsExportModal: React.FC<OwnProps> = ({
  close,
  handleExport,
  title,
}) => {
  const [form] = Form.useForm()
  const {
    data: owners, fetch: fetchOwners,
  } = useResources<Client>('clients')

  const ownerOption = Form.useWatch('ownerId', form)

  const projectId = Form.useWatch('projectId', form)

  const fetchOwnersByValue = (value: string) => fetchOwners({
    apiConfig: {
      filter: {
        filterable_fields: value,
      },
    },
  })

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
          key="submit"
          type="primary"
          onClick={() => { handleExport(projectId); close() }}
          disabled={!projectId}
        >
          {I18n.t('administration.development_actions.export.title')}
        </Button>,
      ]}
    >
      <Form
        form={form}
      >
        <Form.Item
          name="ownerId"
          label={I18n.t('common.column.client')}
          style={{ marginLeft: '8px', maxWidth: '98.5%' }}
        >
          <Select
            showSearch
            filterOption={false}
            placeholder={
              I18n.t('administration.development_actions.form.client_placeholder')
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
