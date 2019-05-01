import React, { useState } from 'react'
import {
  Typography, Form, Icon, Input, Button, Select, Row, Col, AutoComplete,
} from 'antd'
import './NominationForm.scss'
import userPresenter from 'presenters/userPresenter'

const { Title } = Typography
const { Option } = Select

export default function NominationForm (props) {
  const {
    subject, addNomination, searchEvaluators,
    match: { params: { campaignId, id: nominationId } },
    nomination: { relationships },
    autocomplete: { users },
  } = props
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [hasErrors, setHasErrors] = useState({ user: false, role: false })

  const handleAdd = () => {
    const errors = { user: false, role: false }
    if (user && role) {
      addNomination({
        campaignId, nominationId, user, role,
      })
      setUser(null)
      setRole(null)
    } else {
      if (!user) { errors.user = true }
      if (!role) { errors.role = true }
    }
    setHasErrors(errors)
  }

  return (
    <div className="nominations-form">
      <Title level={4}>
        <div>
          Nominate Evaluators to
          {' '}
          {subject.name}
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
            validateStatus={hasErrors.role ? 'error' : ''}
            help={hasErrors.role ? 'Role is required' : ''}
          >
            <Select
              value={role}
              onChange={value => setRole(value)}
              placeholder="Select Relationship"
              className="relationship-select"
            >
              <Option value="" disabled>Select Relationship</Option>
              {relationships.map(role => <Option key={role.id} value={role.id}>{role.name}</Option>)}
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
