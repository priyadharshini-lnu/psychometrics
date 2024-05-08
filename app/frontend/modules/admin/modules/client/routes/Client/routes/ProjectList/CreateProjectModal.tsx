import React from 'react'
import {
  Form, Input,
} from 'antd'
import { CreateResource } from '~/hooks/useResources/interfaces'
import ResourceFormModal from '~/components/ResourceFormModal'
import { Project } from '~/modules/admin/modules/client/core/projects'

interface Props {
  addProject: CreateResource<Project | {clientId: string }>
  close(): void
}

export const CreateProjectModal: React.FC<Props> = ({
  addProject,
  close,
}) => (
  <ResourceFormModal
    resourceName="projects"
    readableResourceName="Project"
    showSuccessMessages
    close={close}
    scrollToFirstError
    modalProps={{ width: 620 }}
    request={{
      createResource: values => addProject({ ...values }),
    }}
  >
    {() => (
      <>
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input name="project_name" />
        </Form.Item>
        <Form.Item name="subdomain" label="Subdomain" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="number" label="Project Number" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </>
    )}
  </ResourceFormModal>
)
