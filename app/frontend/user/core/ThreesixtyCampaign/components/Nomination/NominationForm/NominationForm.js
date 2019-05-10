import React from 'react'
import {
  Typography, Form, Icon, Input, Button, Select, Row, Col, AutoComplete,
} from 'antd'
import './styles.scss'
import userPresenter from 'presenters/userPresenter'

const { Title } = Typography
const { Option } = Select

export default function NominationForm (props) {
  const {
    addNomination, searchEvaluators, updateForm,
    match: { params: { campaignId, id: nominationId } },
    nomination: { subject, relationships, form },
    autocomplete: { users },
  } = props

  const handleAdd = () => {
    addNomination({
      campaignId, nominationId, ...form.attrs,
    })
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
            validateStatus={form.errors.evaluatorId ? 'error' : ''}
            help={form.errors.evaluatorId && form.errors.evaluatorId}
          >
            <AutoComplete
              dataSource={users.map(user => ({
                value: user.id,
                text: userPresenter.getFullNameWithEmail(user),
              }))}
              autoFocus
              placeholder="type name or email..."
              onSelect={userId => updateForm({ ...form.attrs, userId })}
            >
              <Input.Search style={{ width: 300 }} onSearch={value => searchEvaluators(campaignId, value)} />
            </AutoComplete>
          </Form.Item>
          <Form.Item>
            as my
          </Form.Item>
          <Form.Item
            validateStatus={form.errors.relationshipId ? 'error' : ''}
            help={form.errors.relationshipId && form.errors.relationshipId}
          >
            <Select
              value={form.attrs.relationshipId}
              onChange={relationshipId => updateForm({ ...form.attrs, relationshipId })}
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
