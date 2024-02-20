import { useEffect } from 'react'
import {
  Modal, Button, Row, Col,
} from 'antd'
import { PlusOutlined, CheckOutlined } from '@ant-design/icons'
import cs from 'classnames'
import List from './Tabs'
import styles from './styles.less'

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
      open
      onCancel={closeModal}
      footer={[
        <Button
          key="add_requirement_set"
          type="primary"
          onClick={() => addNominationRequirement({ relationshipId: defaultSelectedRelationship })}
          className={styles.addButton}
        >
          <PlusOutlined />
          Add Requirement set
        </Button>,
        <Button key="back" onClick={closeModal}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSave}>
          <CheckOutlined />
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
