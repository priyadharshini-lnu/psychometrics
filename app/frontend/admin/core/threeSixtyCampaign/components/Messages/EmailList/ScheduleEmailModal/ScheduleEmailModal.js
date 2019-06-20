import React, { useState } from 'react'
import _ from 'lodash'
import {
  Modal, Button, Icon,
} from 'antd'
import ErrorAlertBox from 'admin/core/threeSixtyCampaign/components/common/ErrorAlertBox'

export default function ScheduleEmailModal ({
  current,
  closeModal,
  match: {
    params: { campaignId },
  },
}) {
  if (current !== 'ScheduleEmailModal') return null

  const [errors, setErrors] = useState(null)

  return (
    <Modal
      width={700}
      title="Schedule Email"
      visible
      onCancel={closeModal}
      footer={[
        <Button key="back" onClick={closeModal}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={() => {}}>
          <Icon type="check" />
          Add
        </Button>,
      ]}
    >

      <ErrorAlertBox errors={errors} />
    </Modal>
  )
}
