import React from 'react'
import { Modal, Button } from 'antd'
import pluralize from 'pluralize'

import UserList from 'admin/core/threeSixtyCampaign/components/UserList/UserList'

export default function RecipientListModal ({ recipientType, recipients, closeModal }) {
  return (
    <Modal
      width={800}
      title={pluralize.plural(recipientType)}
      visible
      onCancel={closeModal}
      bodyStyle={{ padding: '0px' }}
      footer={[
        <Button key="back" onClick={() => closeModal('RecipientListModal')}>
          Cancel
        </Button>,
      ]}
    >
      <UserList dataSource={recipients} />
    </Modal>
  )
}
