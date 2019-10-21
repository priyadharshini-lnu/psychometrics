import React, { useState } from 'react'

import {
  Modal, Button, Form, Input,
} from 'antd'
import ErrorAlertBox from 'admin/core/threeSixtyCampaign/components/common/ErrorAlertBox'

export default function UserEditModal ({
  closeModal,
  update,
  save,
  user: {
    id,
    email,
    firstName,
    lastName,
  },
  user,
  match: {
    params: { campaignId },
  },
}) {
  const [errors, setErrors] = useState(null)

  const handleOnCancel = () => {
    closeModal()
    setErrors(null)
  }

  const handleInputChange = ({ target: { name, value } }) => {
    update(id, name, value)
  }

  const handleSave = () => {
    save(campaignId, user)
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
        >
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
