import React, { useState } from 'react'

import {
  Modal, Button, Form, Input, Icon,
} from 'antd'
import ErrorAlertBox from 'admin/core/threeSixtyCampaign/components/common/ErrorAlertBox'

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
  onUserUpdate,
  saveInProgress,
  match: {
    params: { campaignId },
  },
}) {
  const [errors, setErrors] = useState(null)
  console.log(saveInProgress)

  const handleOnCancel = () => {
    closeModal()
  }

  const handleInputChange = ({ target: { name, value } }) => {
    update(name, value)
  }

  const handleSave = () => {
    save(campaignId, user).then(() => {
      setErrors(null)
      onUserUpdate()
    }).catch(setErrors)
  }

  const saveButtonIcon = () => {
    if (saveInProgress) {
      return <Icon type="loading" />
    }
    return <Icon type="check" />
  }

  return (
    <Modal
      width={700}
      title="Edit User"
      visible
      onCancel={handleOnCancel}
      footer={[
        <Button key="back" onClick={handleOnCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSave}
          disabled={saveInProgress}
        >
          {saveButtonIcon()}
          Save
        </Button>,
      ]}
    >
      <ErrorAlertBox errors={errors} className="mtl mbl" />
      <Form className="editProfile">
        <Form.Item label="Email">
          <Input value={email} disabled />
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
