import React, { useState } from 'react'
import {
  Typography, Form, Icon, Input, Button, Select, Row, Col, AutoComplete,
} from 'antd'
import './styles.scss'
import userPresenter from 'presenters/userPresenter'

const { Title } = Typography
const { Option } = Select

export default function NominationForm (props) {
  const {
    addNomination, searchEvaluators,
    match: { params: { campaignId, id: nominationId } },
    nomination: { subject, relationships },
    autocomplete: { users },
  } = props

  const [user, setUser] = useState(null)
  const [relationship, setRelationship] = useState(null)
  const [hasErrors, setHasErrors] = useState({ user: false, relationship: false })

  const handleAdd = () => {
    const errors = { user: false, relationship: false }
    if (user && relationship) {
      addNomination({
        campaignId, nominationId, userId: user, relationshipId: relationship,
      })
      setUser(null)
      setRelationship(null)
    } else {
      if (!user) { errors.user = true }
      if (!relationship) { errors.relationship = true }
    }
    setHasErrors(errors)
  }

  return (
    <div className="nominations-form">
      <Title level={4}>
        <div>
          Nominate Evaluators to
          {' '}
          {subject.isSelf ? 'Yourself' : userPresenter.getFullName(subject)}
        </div>
      </Title>
      <div className="form">
        <Form layout="inline">
          <Form.Item
            validateStatus={hasErrors.user ? 'error' : ''}
            help={hasErrors.user ? 'User is required' : ''}
          >
            <AutoComplete
              dataSource={users.map(user => ({
                value: user.id,
                text: userPresenter.getFullNameWithEmail(user),
              }))}
              autoFocus
              placeholder="type name or email..."
              onSelect={userId => setUser(userId)}
            >
              <Input.Search style={{ width: 300 }} onSearch={value => searchEvaluators(campaignId, value)} />
            </AutoComplete>
          </Form.Item>
          <Form.Item>
            as my
          </Form.Item>
          <Form.Item
            validateStatus={hasErrors.relationship ? 'error' : ''}
            help={hasErrors.relationship ? 'Relationship is required' : ''}
          >
            <Select
              value={relationship}
              onChange={value => setRelationship(value)}
              placeholder="Select Relationship"
              className="relationship-select"
            >
              <Option value="" disabled>Select Relationship</Option>
              {relationships.map(relation => <Option key={relation.id} value={relation.id}>{relation.name}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button onClick={handleAdd} type="primary" htmlType="submit">
              Nominate Evaluator
            </Button>
          </Form.Item>
        </Form>
        <Row type="flex" justify="end" gutter={16}>
          <Col>
            <Button type="primary" htmlType="submit">
              Email Approval Request
            </Button>
          </Col>
          <Col>
            <Button type="primary" htmlType="submit">
              <Icon type="mail" />
              Remind All
            </Button>
          </Col>
        </Row>
      </div>
    </div>
  )
}
