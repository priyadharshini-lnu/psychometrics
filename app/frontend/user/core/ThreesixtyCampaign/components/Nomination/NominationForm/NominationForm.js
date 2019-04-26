import React, { useState } from 'react'
import {
  Typography, Form, Icon, Input, Button, Select, Row, Col,
} from 'antd'
import './NominationForm.scss'

const { Title } = Typography
const { Option } = Select

export default function NominationForm (props) {
  const { subject, addNomination } = props
  const [name, setName] = useState('')
  const [role, setRole] = useState(null)
  const [hasErrors, setHasErrors] = useState({ name: false, role: false })
  const handleAdd = () => {
    if (name && role) {
      addNomination({ name, role })
      setName('')
      setRole('')
    } else {
      const errors = { name: false, role: false }
      if (!name) { errors.name = true }
      if (!role) { errors.role = true }
      setHasErrors(errors)
    }
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
            validateStatus={hasErrors.name ? 'error' : ''}
            help={hasErrors.name ? 'Name is required' : ''}
          >
            <Input
              value={name}
              onChange={({ currentTarget: { value } }) => setName(value)}
              placeholder="type name or email..."
              className="name-input"
            />
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
              <Option value="customer">Customer</Option>
              <Option value="directReport">Direct Report</Option>
              <Option value="manager">Manager</Option>
              <Option value="peer">Peer</Option>
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
