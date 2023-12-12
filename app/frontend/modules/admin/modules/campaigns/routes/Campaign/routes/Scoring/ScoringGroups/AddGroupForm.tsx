
import {
  Drawer, Form, Input, Button,
} from 'antd'
import { DirectionalNavigateBackIcon } from '~/glint'

export const AddGroupForm = ({ open, onClose, addGroup }) => (
  <Drawer destroyOnClose closeIcon={<DirectionalNavigateBackIcon />} title="Add Group" open={open} onClose={onClose}>
    <Form colon={false} layout="vertical" onFinish={addGroup}>
      <Form.Item name="name" label="Name">
        <Input />
      </Form.Item>
      {/* Added for testing purpose */}
      {/* <Form.Item name="id" label="ID">
        <Input />
      </Form.Item>
      <Form.Item name="position" label="Position">
        <Input />
      </Form.Item> */}
      <Form.Item>
        <Button onClick={onClose} type="primary" htmlType="submit">Save</Button>
      </Form.Item>
    </Form>
  </Drawer>
)
