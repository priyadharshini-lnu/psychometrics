import { FC } from 'react'
import {
  Drawer, Form, Input, Button,
} from 'antd'
import { Store } from 'antd/es/form/interface'
import { FormInstance } from 'antd/es/form'
import { DirectionalNavigateBackIcon } from '~/glint'
import ResourceForm from '~/components/ResourceForm'
import { CampaignFactorGroup } from './GroupCard'

const { I18n } = window

type AddGroupFormProps = {
  open: boolean
  onClose: () => void
  addGroup: (values) => Promise<void> | void
}

export const AddGroupForm: FC<AddGroupFormProps> = ({ open, onClose, addGroup }) => {
  const handleFormFinish = () => {
    onClose()
  }

  return (
    <Drawer
      destroyOnHidden
      closeIcon={<DirectionalNavigateBackIcon />}
      title={I18n.t('admin.scoring_add_group')}
      open={open}
      onClose={onClose}
    >
      <GroupForm addGroup={addGroup} nameLabel={I18n.t('shared.name')} onFormFinish={handleFormFinish}>
        <Form.Item>
          <Button type="primary" htmlType="submit">{I18n.t('shared.save')}</Button>
        </Form.Item>
      </GroupForm>
    </Drawer>
  )
}

type GroupFormProps = {
  onFormFinish: () => void
  children?: React.ReactNode
  onBlur?: (form: FormInstance) => void
  initialValues?: Store
  nameLabel: string
  noStyle?: boolean
  addGroup?: (values) => Promise<void> | void
  editGroup?: (values, group) => Promise<void> | void
  group?: CampaignFactorGroup
}

export const GroupForm:FC<GroupFormProps> = ({
  onFormFinish, children, onBlur, initialValues, nameLabel, noStyle, addGroup, editGroup, group,
}) => {
  const [form] = Form.useForm()

  const handleFormFinish = () => {
    onFormFinish()
  }

  return (
    <ResourceForm
      resourceName="campaign_factor_groups"
      readableResourceName="Campaign Factor Group"
      storeManager={{ form }}
      resource={editGroup ? group : undefined}
      resourceId={group?.id}
      showSuccessMessages
      formProps={{
        labelAlign: 'left',
        initialValues,
        colon: false,
        layout: 'vertical',
        validateMessages: {
          required: I18n.t('admin.scoring_required_error'),
          pattern: { mismatch: I18n.t('admin.scoring_pattern_error') },
        },
        requiredMark: false,
        onBlur: () => { onBlur && onBlur(form) },
      }}
      scrollToFirstError
      request={{
        createResource: addGroup,
        updateResource: value => editGroup && editGroup(value, group),
      }}
      onSuccessfulSubmission={handleFormFinish}
    >
      {() => (
        <>
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
            <Input autoFocus maxLength={64} autoCapitalize="false" name="campaign_factor_group_name" />
          </Form.Item>
          {children}
        </>
      )}
    </ResourceForm>
  )
}
