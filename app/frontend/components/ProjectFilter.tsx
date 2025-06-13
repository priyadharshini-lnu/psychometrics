import { useRef, useEffect, useState } from 'react'
import {
  Button, Form, Switch, Flex,
} from 'antd'
import {
  OwnerAndProjectDropdown,
  useClientsAndProjectsResource,
} from '~/components/OwnerAndProjectDropdown'
import { ProjectWithClient } from '~/modules/admin/modules/client/core/projects'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { useResources } from '~/hooks/useResources'

const { I18n } = window

export const ProjectFilter = () => {
  const formRef = useRef<{ resetForm:() => void,
    setForm: (values: {projectId:string, ownerId: string}) => void }>(null)
  const [form] = Form.useForm()
  const { resource } = useResourceContext()
  const global = Form.useWatch('global', form)
  const [projectId, setProjectId] = useState<string | null>()
  const [ownerId, setOwnerId] = useState<string | null>()
  const [projectDetails, setProjectDetails] = useState<ProjectWithClient | null>(null)

  const {
    fetchSingle: fetchProject,
  } = useResources<ProjectWithClient>('projects', {
    apiConfig: {
      include: ['client'],
    },
  })

  const filter = resource.getAppliedFiltersFromURL()
  const {
    owners,
    projects,
    setProjects,
    handleProjectsSearch,
    handleOwnersSearch,
  } = useClientsAndProjectsResource(ownerId || '')


  useEffect(() => {
    if (!projectDetails && filter?.project_id_eq) {
      fetchProject({ id: filter?.project_id_eq as string }).then((data: ProjectWithClient) => {
        setProjectDetails(data as ProjectWithClient)
        setOwnerId(data.clientId)
        setProjectId(data.id)
        formRef.current?.setForm({ ownerId: data.clientId, projectId: data.id })
      })
    } else if (!projectDetails && !filter?.project_id_eq && !filter?.global) {
      handleOwnersSearch()
    }
  }, [])


  const handleValuesGlobalChange = (changedValues: Record<string, string>) => {
    if (changedValues?.global) {
      resetOwnerAndClients()
    } else {
      handleOwnersSearch()
    }
  }

  const resetOwnerAndClients = () => {
    setProjectDetails(null)
    setProjectId(null)
    setOwnerId(null)
    formRef.current?.resetForm()
  }


  const handleValuesChange = (changedValues: Record<string, string>) => {
    if (changedValues?.ownerId) {
      setProjects([])
      setProjectDetails(null)
      setOwnerId(changedValues?.ownerId)
      setProjectId(null)
    }

    if (changedValues?.projectId) {
      setProjectId(changedValues?.projectId)
    }
  }

  useEffect(() => {
    if (ownerId && ownerId !== projectDetails?.clientId) {
      handleProjectsSearch()
    }
  }, [ownerId])

  const projectsOpts = projectDetails && !projects.find(p => p.id === projectDetails.id)
    ? projects.concat(projectDetails) : projects
  const ownersOpts = projectDetails?.client && !owners.find(o => o.id === projectDetails.clientId)
    ? owners.concat(projectDetails.client) : owners

  const handleReset = () => {
    formRef.current?.resetForm()
    form.setFieldsValue({ global: false })
    resource.changeUrlQuery({
      filter: {},
    })
    setProjectDetails(null)
  }

  const handleFilter = () => {
    if (global) {
      resource.changeUrlQuery({
        filter: {
          global: 'true',
        },
      })
      setProjectDetails(null)
    } else {
      resource.changeUrlQuery({
        filter: {
          project_id_eq: projectId as string,
        },
      })
    }
  }

  return (
    <div style={{ width: '400px', padding: '2rem' }}>
      <Form
        form={form}
        onValuesChange={handleValuesGlobalChange}
        initialValues={{ global: filter?.global }}
      >
        <Form.Item
          name="global"
          label="Global"
        >
          <Switch />
        </Form.Item>
      </Form>
      {!global ? (
        <OwnerAndProjectDropdown
          ref={formRef}
          projectOpts={projectsOpts}
          ownerOpts={ownersOpts}
          onProjectsSearch={handleProjectsSearch}
          onOwnersSearch={handleOwnersSearch}
          onValuesChange={handleValuesChange}
        />
      ) : null}
      <Flex justify="space-between">
        <Button
          size="small"
          onClick={handleReset}
        >
          {I18n.t('common.actions.reset')}
        </Button>
        <Button
          type="primary"
          size="small"
          disabled={!global && !projectId}
          onClick={handleFilter}
        >
          {I18n.t('common.actions.filter')}
        </Button>
      </Flex>
    </div>
  )
}
