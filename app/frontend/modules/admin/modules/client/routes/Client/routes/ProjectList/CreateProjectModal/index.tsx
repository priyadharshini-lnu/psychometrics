import React from 'react'
import ResourceFormModal from 'components/ResourceFormModal'
import { Form, Input } from 'antd'

interface Props {
  // props declaration here
}

export const CreateProjectModal: React.FC<Props> = () => (
  <ResourceFormModal
    resourceName="createProject"
    resourceBaseUrl="test"
    close={close}
    modalProps={{ width: 550 }}
  >
    {() => (
      <>
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="subdomain" label="Subdomain" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="projectNumber" label="Project Number" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </>
    )}
  </ResourceFormModal>
)
