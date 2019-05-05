import React, { useEffect } from 'react'
import {
  Modal, Button, Tabs, Row, Col, Avatar,
} from 'antd'

import userPresenter from 'presenters/userPresenter'
import styles from './styles.scss'
import EvaluatorList from './EvaluatorList'
import EvaluationList from './EvaluationList'

export default function ParticipantModal ({
  current,
  closeModal,
  user,
  fetchParticipants,
  fetchRelationships,
  match: {
    params: { campaignId },
  },
}) {
  if (current !== 'ParticipantModal') return null

  useEffect(() => {
    fetchParticipants(campaignId, user.id)
    fetchRelationships(campaignId)
  }, [])
  return (
    <Modal
      width={1200}
      title={<Header user={user} />}
      visible
      onCancel={closeModal}
      footer={[
        <Button key="back" onClick={closeModal}>
          Close
        </Button>,
      ]}
    >
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Relationships" key="1">
          Relationships
        </Tabs.TabPane>
        <Tabs.TabPane tab="Evaluators" key="2">
          <EvaluatorList />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Evaluations" key="3">
          <EvaluationList />
        </Tabs.TabPane>
      </Tabs>
    </Modal>
  )
}

const Header = ({ user }) => (
  <Row type="flex" className={styles.header} align="middle">
    <Col span={6}>
      <Avatar size={64} icon="user" />
    </Col>
    <Col span={18}>
      <div>{userPresenter.getFullName(user)}</div>
      <div className={styles.email}>
        <small>{user.email}</small>
      </div>
    </Col>
  </Row>
)
