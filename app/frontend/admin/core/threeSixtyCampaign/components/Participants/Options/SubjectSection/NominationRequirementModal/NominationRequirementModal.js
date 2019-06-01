import React, { useEffect } from 'react'
import {
  Modal, Button, Icon, Row, Col,
} from 'antd'
import List from './List'
import ConditionsContainer from './ConditionsContainer'
import css from './style.scss'
import cs from 'classnames'

export default function NominationRequirementModal ({
  currentModal,
  closeModal,
  nominationsPresent,
  defaultSelectedRelationship,
  addNominationRequirement,
  syncWithServer,
  fetchNominationRequirements,
  match: {
    params: { campaignId },
  }
}) {
  // if (currentModal !== 'NominationRequirement') return null

  useEffect(() => {
    fetchNominationRequirements(campaignId)
  }, [])

  const handleSave = () => {}

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
          style={{ float: 'left' }}>
          <Icon type="plus" />
          Add Requirement set
        </Button>,
        <Button key="back" onClick={closeModal}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={syncWithServer}>
          <Icon type="check" />
          Save
        </Button>,
      ]}
    >
      <Row>
        <Col span={6} className={cs([css.section, css.listSection])}>
          <List />
        </Col>
        {nominationsPresent
          && (
          <Col span={18} className={css.section}>
            <ConditionsContainer />
          </Col>
          )}
      </Row>
    </Modal>
  )
}
