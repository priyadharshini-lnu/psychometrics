import React, { useState } from 'react'
import {
  Modal, Button, Icon, Input, Alert, message,
} from 'antd'
import ErrorAlertBox from 'admin/core/threeSixtyCampaign/components/common/ErrorAlertBox'

export default function SendTestEmailModal ({
  current,
  closeModal,
  sendTestEmail,
  match: {
    params: { campaignId, id },
  },
}) {
  if (current !== 'SendTestEmailModal') return null

  const [email, setEmail] = useState(null)
  const [errors, setErrors] = useState(null)

  const handleSendTestEmail = () => {
    sendTestEmail(campaignId, id, email)
      .then(() => {
        closeModal()
        setErrors(null)
        message.success('Test email sent successfully', 5)
      })
      .catch((errors) => {
        setErrors(errors)
      })
  }

  return (
    <Modal
      width={500}
      title="Send Test Email"
      visible
      onCancel={closeModal}
      footer={[
        <Button key="back" onClick={closeModal}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSendTestEmail}>
          <Icon type="check" />
          Send Test
        </Button>,
      ]}
    >
      <div className="mbl">
        <Alert
          message="Test emails do not include login information or pipeed text."
          type="info"
          size="small"
          showIcon
        />
      </div>
      <Input
        placeholder="Enter email address"
        prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
        value={email}
        size="large"
        onChange={e => setEmail(e.target.value)}
      />
      <ErrorAlertBox errors={errors} />
    </Modal>
  )
}
