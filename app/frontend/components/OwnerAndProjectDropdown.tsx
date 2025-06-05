import {
  forwardRef, useImperativeHandle,
} from 'react'
import {
  Form, Select,
} from 'antd'
import { debounce } from 'lodash'
import { Client } from '~/modules/admin/modules/client/core/clients'
import { Project } from '~/modules/admin/modules/client/core/projects'
import { useResources } from '~/hooks/useResources'

const { I18n } = window

type Props = {
  projectOpts?: Project[],
  ownerOpts?: Client[],
  onProjectsSearch?: (value?: string) => void,
  onOwnersSearch?: (value?: string) => void,
  onValuesChange?: (changedValues: Record<string, string>, values?: Record<string, string>) => void,
}

export const OwnerAndProjectDropdown = forwardRef(({
  projectOpts,
  ownerOpts,
  onProjectsSearch,
  onOwnersSearch,
  onValuesChange,
}: Props, ref) => {
  const [form] = Form.useForm()
  const ownerId = Form.useWatch('ownerId', form)

  const handleProjectsSearch = debounce((value: string) => {
    onProjectsSearch?.(value)
  }, 300)

  const handleOwnersSearch = debounce((value: string) => {
    onOwnersSearch?.(value)
  }, 300)

  const handleValuesChanges = (changedValues: Record<string, string>, values: Record<string, string>) => {
    if (changedValues?.ownerId && !changedValues?.projectId) {
      form.resetFields(['projectId'])
    }
    onValuesChange?.(changedValues, values)
  }

  useImperativeHandle(ref, () => ({
    resetForm: () => {
      form.resetFields(['projectId', 'ownerId'])
    },
    setForm: (initialValues: {ownerId: string, projectId: string}) => {
      form.setFieldsValue(initialValues)
    },
  }), [form])

  return (
    <Form
      form={form}
      onValuesChange={handleValuesChanges}
    >
      <>
        <Form.Item
          name="ownerId"
          label={I18n.t('common.column.client')}
        >
          <Select
            showSearch
            filterOption={false}
            placeholder={I18n.t('administration.skills.form.client_placeholder')}
            onSearch={handleOwnersSearch}
            options={ownerOpts?.map(p => ({
              value: p.id,
              label: p.name,
            }))}
          />
        </Form.Item>
        <Form.Item
          name="projectId"
          label={I18n.t('common.column.project')}
        >
          <Select
            showSearch
            filterOption={false}
            key={ownerId}
            onSearch={handleProjectsSearch}
            options={projectOpts?.map(p => ({
              value: p.id,
              label: p.name,
            }))}
            disabled={!ownerId}
            placeholder={I18n.t('administration.skills.form.project_placeholder')}
          />
        </Form.Item>
      </>
    </Form>
  )
})


export const useClientsAndProjectsResource = (ownerId : string) => {
  const { data: owners, fetch: fetchOwners, setData: setOwners } = useResources<Client>('clients')
  const {
    data: projects, fetch: fetchProjects, setData:
        setProjects,
  } = useResources<Project>('projects', { basePath: `clients/${ownerId}` })

  const handleProjectsSearch = (value = '') => fetchProjects({
    apiConfig: {
      filter: {
        filterable_fields: value,
      },
    },
  })

  const handleOwnersSearch = (value = '') => fetchOwners({
    apiConfig: {
      filter: {
        filterable_fields: value,
      },
    },
  })

  return {
    owners,
    setOwners,
    projects,
    setProjects,
    handleProjectsSearch,
    handleOwnersSearch,
  }
}
