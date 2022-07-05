import React, { useState, useEffect } from 'react'
import {
  Form,
  Input,
  Modal,
  Button,
  message,
} from 'antd'
import { CheckOutlined } from '@ant-design/icons'
import './styles.less'
import ErrorAlertBox from 'components/ErrorAlertBox'

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
    setProfileDetails({ ...profileDetails, [name]: value || undefined })
  }

  return (
    <Modal
      width={600}
      title={I18n.t('update_profile.title')}
      visible
      onCancel={closeModal}
      footer={[
        <Button key="back" onClick={closeModal}>
          {I18n.t('update_profile.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleFormSave}
        >
          <CheckOutlined />
          {I18n.t('update_profile.update')}
        </Button>,
      ]}
    >
      <ErrorAlertBox errors={errors} className="mtl mbl" />
      <Form className="editProfile">
        <Form.Item label={I18n.t('user.fields.email')}>
          <Input value={email} disabled />
        </Form.Item>


        <Form.Item label={I18n.t('user.fields.password')}>
          <Input.Password value={password} name="password" onChange={handleInputChange} />
        </Form.Item>

        <Form.Item label={I18n.t('user.fields.first_name')}>
          <Input value={firstName} name="firstName" onChange={handleInputChange} />
        </Form.Item>

        <Form.Item label={I18n.t('user.fields.last_name')}>
          <Input value={lastName} name="lastName" onChange={handleInputChange} />
        </Form.Item>
      </Form>
    </Modal>
  )
}
