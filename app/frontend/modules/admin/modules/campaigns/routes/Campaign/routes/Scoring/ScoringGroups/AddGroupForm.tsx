
import {
  Drawer, Form, Input, Button,
} from 'antd'
import { DirectionalNavigateBackIcon } from '~/glint'

const { I18n } = window

export const AddGroupForm = ({ open, onClose, addGroup }) => {
  const handleFormFinish = (data) => {
    addGroup(data)
    onClose()
  }
  return (
    <Drawer
      destroyOnClose
      closeIcon={<DirectionalNavigateBackIcon />}
      title={I18n.t('administration.scoring.add_group')}
      open={open}
      onClose={onClose}
    >
      <Form
        colon={false}
        layout="vertical"
        onFinish={handleFormFinish}
        validateMessages={{
          required: I18n.t('administration.scoring.required_error'),
        }}
        requiredMark={false}
      >
        <Form.Item
          rules={[{ required: true, whitespace: true }]}
          name="name"
          label={I18n.t('administration.scoring.name')}
        >
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">{I18n.t('administration.scoring.save')}</Button>
        </Form.Item>
      </Form>
    </Drawer>
  )
}
