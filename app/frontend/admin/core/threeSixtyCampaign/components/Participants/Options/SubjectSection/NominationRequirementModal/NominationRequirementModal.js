import React from 'react'
import {
  Modal, Button, Icon, Row, Col,
} from 'antd'
import List from './List'
import ConditionsContainer from './ConditionsContainer'

export default function NominationRequirementModal ({
  currentModal,
  closeModal,
  nominationsPresent,
  addNominationRequirement,
}) {
  // if (currentModal !== 'NominationRequirement') return null

  const handleSave = () => {}

  return (
    <Modal
      width={1000}
      title="Nomination Requirements"
      bodyStyle={{ padding: '0px' }}
      visible
      onCancel={closeModal}
      footer={[
        <Button key="add_requirement_set" type="primary" onClick={addNominationRequirement} style={{ float: 'left' }}>
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
        <Col span={6} style={{ borderRight: '1px solid #ccc', height: '500px' }}>
          <List />
        </Col>
        {nominationsPresent
          && (
          <Col span={18}>
            <ConditionsContainer />
          </Col>
          )}
      </Row>
    </Modal>
  )
}
