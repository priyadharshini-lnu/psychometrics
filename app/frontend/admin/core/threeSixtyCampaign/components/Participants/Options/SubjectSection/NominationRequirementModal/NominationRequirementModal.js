import React, { useEffect } from 'react'
import {
  Modal, Button, Icon, Row, Col,
} from 'antd'
import cs from 'classnames'
import List from './Tabs'
import styles from './styles.scss'

export default function NominationRequirementModal ({
  closeModal,
  nominationRequirements,
  defaultSelectedRelationship,
  addNominationRequirement,
  syncWithServer,
  fetchNominationRequirements,
  match: {
    params: { campaignId },
  },
}) {
  useEffect(() => {
    fetchNominationRequirements(campaignId)
  }, [])

  const handleSave = () => {
    syncWithServer(campaignId, nominationRequirements)
    closeModal()
  }

  return (
    <Modal
      width={1000}
      title="Nomination Requirements"
      bodyStyle={{ padding: '0px' }}
      visible
      onCancel={closeModal}
      footer={[
        <Button
          key="add_requirement_set"
          type="primary"
          onClick={() => addNominationRequirement({ relationshipId: defaultSelectedRelationship })}
          className={styles.addButton}
        >
          <Icon type="plus" />
          Add Requirement set
        </Button>,
        <Button key="back" onClick={closeModal}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSave}>
          <Icon type="check" />
          Save
        </Button>,
      ]}
    >
      <Row>
        <Col span={24} className={cs([styles.section, styles.listSection])}>
          <List />
        </Col>
      </Row>
    </Modal>
  )
}
