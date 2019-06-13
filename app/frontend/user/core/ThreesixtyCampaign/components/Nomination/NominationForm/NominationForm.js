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
    showForm, hideForm,
    match: { params: { campaignId, id: nominationId } },
    nomination: {
      subject, relationships, form, form: { show },
    },
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
          {subject.isSelf ? 'Yourself' : userPresenter.getFullNameWithEmail(subject)}
        </div>
      </Title>

      <div className="form">
        {show
          ? (
            <Form layout="inline">
              <Form.Item>
                <Button type="primary" shape="circle" icon="close" size="large" onClick={hideForm} />
              </Form.Item>
              <Form.Item
                validateStatus={form.errors.evaluatorId ? 'error' : ''}
                help={form.errors.evaluatorId && form.errors.evaluatorId}
              >
                <AutoComplete
                  dataSource={users.map(user => ({
                    value: user.email,
                    text: userPresenter.getFullNameWithEmail(user),
                  }))}
                  autoFocus
                  placeholder="type name or email..."
                  onSelect={email => updateForm({ ...form.attrs, email })}
                >
                  <Input.Search
                    style={{ width: 240 }}
                    onSearch={value => searchEvaluators(campaignId, nominationId, value)}
                  />
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
                  {relationships.map(relation => (
                    <Option
                      key={relation.id}
                      value={relation.id}
                    >
                      {relation.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item>
                <Button onClick={handleAdd} type="primary">
                  Nominate
                </Button>
              </Form.Item>
            </Form>
          )
          : (
            <Button type="primary" shape="circle" icon="plus" size="large" onClick={showForm} />
          )}
        <Row type="flex" justify="end" gutter={8}>

          <Col>
            <Button type="link">
              <Icon type="team" />
              Remind All
            </Button>
          </Col>
          <div className="divider" />
          <Col>
            <Button type="primary">
              Approve All
            </Button>
          </Col>
          <Col>
            <Button type="danger" className="deny-button">
              Deny All
            </Button>
          </Col>
        </Row>
      </div>

    </div>
  )
}
