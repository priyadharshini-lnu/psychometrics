import { useState, FC } from 'react'
import {
  Drawer, Form, Input, Button,
} from 'antd'
import { Store } from 'antd/es/form/interface'
import { FormInstance } from 'antd/lib'
import { DirectionalNavigateBackIcon } from '~/glint'

const { I18n } = window

type AddGroupFormProps = {
  open: boolean
  onClose: () => void
  addGroup: (data: Store) => void
}

export const AddGroupForm: FC<AddGroupFormProps> = ({ open, onClose, addGroup }) => {
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
      <GroupForm nameLabel={I18n.t('administration.scoring.name')} onFormFinish={handleFormFinish}>
        <Form.Item>
          <Button type="primary" htmlType="submit">{I18n.t('administration.scoring.save')}</Button>
        </Form.Item>
      </GroupForm>
    </Drawer>
  )
}

type GroupFormProps = {
  onFormFinish: (data: Store) => void
  children?: React.ReactNode
  onBlur?: (form: FormInstance) => void
  initialValues?: Store
  nameLabel: string
  noStyle?: boolean
}

export const GroupForm:FC<GroupFormProps> = ({
  onFormFinish, children, onBlur, initialValues, nameLabel, noStyle,
}) => {
  const [, setFields] = useState({})
  const [form] = Form.useForm()

  const handleFormFinish = (data) => {
    onFormFinish({ ...data, name: data.name.trim() })
  }

  return (
    <Form
      form={form}
      colon={false}
      layout="vertical"
      onFinish={handleFormFinish}
      validateMessages={{
        required: I18n.t('administration.scoring.required_error'),
        pattern: { mismatch: I18n.t('administration.scoring.pattern_error') },
      }}
      requiredMark={false}
      onFieldsChange={(_, allFields) => {
        setFields(allFields)
      }}
      onBlur={() => { onBlur && onBlur(form) }}
      initialValues={initialValues}
    >
      <Form.Item
        rules={[{
          required: true,
          whitespace: true,
          pattern: /^[a-zA-Z0-9\- ]+$/,
        }]}
        name="name"
        label={nameLabel}
        noStyle={noStyle}
      >
        <Input autoFocus maxLength={64} autoCapitalize="false" />
      </Form.Item>
      {children}
    </Form>
  )
}
