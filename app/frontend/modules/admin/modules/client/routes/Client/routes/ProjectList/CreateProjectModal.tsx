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

const { I18n } = window

export const CreateProjectModal: React.FC<Props> = ({
  addProject,
  close,
}) => (
  <ResourceFormModal
    resourceName="projects"
    readableResourceName={I18n.t('administration.projects.form.title')}
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
        <Form.Item name="name" label={I18n.t('administration.projects.form.name')} rules={[{ required: true }]}>
          <Input name="project_name" />
        </Form.Item>
        <Form.Item
          name="subdomain"
          label={I18n.t('administration.projects.form.subdomain')}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="number"
          label={I18n.t('administration.projects.form.project_number')}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
      </>
    )}
  </ResourceFormModal>
)
