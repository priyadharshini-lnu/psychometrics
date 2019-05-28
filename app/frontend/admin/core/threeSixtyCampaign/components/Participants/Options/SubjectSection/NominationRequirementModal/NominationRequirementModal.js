import React from 'react'
import _ from 'lodash'
import {
  Modal, Button, Icon, Divider, Alert,
} from 'antd'

export default function NominationRequirementModal ({
  currentModal,
  closeModal,
  match: {
    params: { campaignId },
  },
}) {
  if (currentModal !== 'NominationRequirement') return null

  const handleSave = () => {}

  return (
    <Modal
      width={900}
      title="Nomination Requirements"
      visible
      onCancel={closeModal}
      footer={[
        <Button key="back" onClick={closeModal}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSave}>
          <Icon type="check" />
          Save
        </Button>,
      ]}
    >

    </Modal>
  )
}
