import { Modal, Button } from 'antd'
import pluralize from 'pluralize'

import UserList from '~/modules/admin/modules/threeSixtyCampaign/routes/UserList/UserList'

export default function RecipientListModal ({ recipientType, recipients, closeModal }) {
  return (
    <Modal
      width={800}
      title={pluralize.plural(recipientType)}
      visible
      onCancel={() => closeModal('RecipientListModal')}
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
