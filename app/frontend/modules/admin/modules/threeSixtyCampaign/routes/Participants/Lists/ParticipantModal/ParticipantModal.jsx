import { useEffect, useState } from 'react'
import {
  Modal, Button, Tabs, Row, Col, Avatar,
} from 'antd'
import { UserOutlined } from '@ant-design/icons'

import userPresenter from '~/presenters/user'
import styles from './styles.less'
import EvaluatorList from './EvaluatorList'
import EvaluationList from './EvaluationList'
import ResultList from './ResultList'

export default function ParticipantModal ({
  closeModal,
  user,
  permissions,
  onClose,
  fetchParticipants,
  fetchRelationships,
  activeKey,
  match: {
    params: { campaignId },
  },
  match,
}) {
  const [currentKey, setCurrentKey] = useState(activeKey || '2')
  useEffect(() => {
    fetchParticipants(campaignId, user.id)
    fetchRelationships(campaignId)
  }, [])

  const onCloseModal = () => {
    onClose()
    closeModal()
  }

  return (
    <Modal
      width={1200}
      title={<Header user={user} />}
      open
      onCancel={onCloseModal}
      footer={[
        <Button key="back" onClick={onCloseModal}>
          Close
        </Button>,
      ]}
    >
      <Tabs defaultActiveKey="2" activeKey={currentKey} onChange={key => setCurrentKey(key)}>
        <Tabs.TabPane tab="Evaluators" key="2">
          <EvaluatorList match={match} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Evaluations" key="3">
          <EvaluationList match={match} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Results" key="results">
          <ResultList permissions={permissions} match={match} />
        </Tabs.TabPane>
      </Tabs>
    </Modal>
  )
}

const Header = ({ user }) => (
  <Row type="flex" className={styles.header} align="middle">
    <Col span={6}>
      <Avatar size={64} icon={<UserOutlined />} />
    </Col>
    <Col span={18}>
      <div>{userPresenter.getFullName(user)}</div>
      <div className={styles.email}>
        <small>{user.email}</small>
      </div>
    </Col>
  </Row>
)
