import { useState } from 'react'

import {
  Modal, Button, Form, Input,
} from 'antd'
import { LoadingOutlined, CheckOutlined } from '@ant-design/icons'
import { isSuperAdmin } from '~/core/currentUser'
import ErrorAlertBox from '~/components/ErrorAlertBox'

export default function UserEditModal ({
  closeModal,
  update,
  save,
  user: {
    email,
    firstName,
    lastName,
  },
  user,
  currentUser,
  onUserUpdate,
  saveInProgress,
  match: {
    params: { campaignId },
  },
}) {
  const [errors, setErrors] = useState(null)

  const handleOnCancel = () => {
    closeModal()
  }

  const handleInputChange = ({ target: { name, value } }) => {
    update(name, value)
  }

  const handleSave = () => {
    save(campaignId, user).then(() => {
      closeModal()
      onUserUpdate()
    }).catch(setErrors)
  }

  const saveButtonIcon = () => {
    if (saveInProgress) {
      return <LoadingOutlined />
    }
    return <CheckOutlined />
  }

  return (
    <Modal
      width={650}
      title={I18n.t('threesixty.edit_user')}
      visible
      onCancel={handleOnCancel}
      footer={[
        <Button key="back" onClick={handleOnCancel}>
          {I18n.t('threesixty.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSave}
          disabled={saveInProgress}
        >
          {saveButtonIcon()}
          {I18n.t('threesixty.save')}
        </Button>,
      ]}
    >
      <ErrorAlertBox errors={errors} className="mtl mbl" />
      <Form>
        <Form.Item label="Email">
          <Input value={email} name="email" disabled={!isSuperAdmin(currentUser)} onChange={handleInputChange} />
        </Form.Item>

        <Form.Item label="First Name">
          <Input value={firstName} name="firstName" onChange={handleInputChange} />
        </Form.Item>

        <Form.Item label="Last Name">
          <Input value={lastName} name="lastName" onChange={handleInputChange} />
        </Form.Item>
      </Form>
    </Modal>
  )
}
