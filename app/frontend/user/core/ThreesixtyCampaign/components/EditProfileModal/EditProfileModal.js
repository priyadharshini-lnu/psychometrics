import React, { useState, useEffect } from 'react'
import {
  Form,
  Input,
  Modal,
  Icon,
  Button,
  message,
} from 'antd'
import './styles.scss'
import ErrorAlertBox from 'admin/core/threeSixtyCampaign/components/common/ErrorAlertBox'

export default function EditProfileModal ({
  user,
  sync,
  closeModal,
}) {
  const [profileDetails, setProfileDetails] = useState(user)
  const {
    email, firstName, lastName, password,
  } = profileDetails

  useEffect(() => {
    setProfileDetails(user)
  }, [user])

  const [errors, setErrors] = useState(null)

  const handleFormSave = () => {
    sync(profileDetails)
      .then(() => {
        setErrors(null)
        closeModal()
        message.success('Profile updated successfully', 5)
      })
      .catch(setErrors)
  }

  const handleInputChange = ({ target: { name, value } }) => {
    setProfileDetails({ ...profileDetails, [name]: value })
  }

  return (
    <Modal
      width={600}
      title="Update Profile"
      visible
      onCancel={closeModal}
      footer={[
        <Button key="back" onClick={closeModal}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleFormSave}
        >
          <Icon type="check" />
          Update
        </Button>,
      ]}
    >
      <ErrorAlertBox errors={errors} className="mtl mbl" />
      <Form className="editProfile">
        <Form.Item label="Email">
          <Input value={email} disabled />
        </Form.Item>


        <Form.Item label="Password">
          <Input.Password value={password} name="password" onChange={handleInputChange} />
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
