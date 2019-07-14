import React, { useEffect } from 'react'
import { Modal, Button } from 'antd'

import RelationshipRow from './RelationshipRow'

export default function ManageRelationshipsModal ({
  closeModal,
  user,
  onClose,
  relationships,
  fetchWithUsage,
  create,
  remove,
  update,
  match: {
    params: { campaignId },
  },
}) {
  useEffect(() => {
    // This is why I love GraphQL
    fetchWithUsage(campaignId)
  }, [])

  return (
    <Modal
      title="Manage Relationships"
      visible
      onCancel={closeModal}
      footer={[
        <Button key="back" onClick={closeModal}>
          Close
        </Button>,
      ]}
    >
      <table>
        <tbody>
          {relationships.map(relationship => (
            <RelationshipRow
              key={relationship.id}
              relationship={relationship}
              create={create}
              remove={remove}
              update={update}
              campaignId={campaignId}
            />
          ))}
        </tbody>
      </table>
    </Modal>
  )
}
