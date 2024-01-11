
import {
  Drawer, Form, Input, Button,
} from 'antd'
import { DirectionalNavigateBackIcon } from '~/glint'

const { I18n } = window

export const AddGroupForm = ({ open, onClose, addGroup }) => (
  <Drawer
    destroyOnClose
    closeIcon={<DirectionalNavigateBackIcon />}
    title={I18n.t('administration.scoring.add_group')}
    open={open}
    onClose={onClose}
  >
    <Form colon={false} layout="vertical" onFinish={addGroup}>
      <Form.Item name="name" label={I18n.t('administration.scoring.name')}>
        <Input />
      </Form.Item>
      <Form.Item>
        <Button onClick={onClose} type="primary" htmlType="submit">{I18n.t('administration.scoring.save')}</Button>
      </Form.Item>
    </Form>
  </Drawer>
)
