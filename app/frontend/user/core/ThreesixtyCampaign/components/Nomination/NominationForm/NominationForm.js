import React from 'react'
import {
  Typography, Form, Icon, Input, Button, Select, Row, Col, AutoComplete, message,
} from 'antd'
import './styles.scss'
import userPresenter from 'presenters/userPresenter'

const { Title } = Typography
const { Option } = Select

export default function NominationForm (props) {
  const {
    addNomination, searchEvaluators, updateForm,
    showForm, hideForm, requestApproval, sendEvaluatorReminder,
    match: { params: { campaignId, id: nominationId } },
    nomination: {
      isSelf, subject, relationships, form, form: { show }, canSendRequestApprovalEmail,
    },
    autocomplete: { users },
  } = props

  const handleAdd = () => {
    addNomination({
      campaignId, nominationId, ...form.attrs,
    })
  }

  const handleRequestApproval = () => {
    requestApproval(campaignId, nominationId)
      .then(() => message.info('Mail for approving nomination has been sent to managers'))
  }

  const handleSendEvaluatorReminder = () => {
    sendEvaluatorReminder(campaignId, nominationId)
      .then(() => message.info("Reminders sent to evaluators who haven't completed the evaluation"))
  }

  return (
    <div className="nominations-form">
      <Title level={4}>
        <div>
          {I18n.t('threesixty.nominate_evaluators')}
          {' '}
          {isSelf ? 'Yourself' : userPresenter.getFullNameWithEmail(subject)}
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
                  placeholder={I18n.t('threesixty.user_name_input_placeholder')}
                  onChange={email => updateForm({ ...form.attrs, email })}
                  onSelect={email => updateForm({ ...form.attrs, email })}
                >
                  <Input.Search
                    style={{ width: 240 }}
                    onSearch={value => searchEvaluators(campaignId, nominationId, value)}
                  />
                </AutoComplete>
              </Form.Item>
              <Form.Item>
                {I18n.t('threesixty.as_my')}
              </Form.Item>
              <Form.Item
                validateStatus={form.errors.relationshipId ? 'error' : ''}
                help={form.errors.relationshipId && form.errors.relationshipId}
              >
                <Select
                  value={form.attrs.relationshipId}
                  onChange={relationshipId => updateForm({ ...form.attrs, relationshipId })}
                  placeholder={I18n.t('threesixty.select_relationnship')}
                  className="relationship-select"
                >
                  <Option value="" disabled>{I18n.t('threesixty.select_relationnship')}</Option>
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
                  {I18n.t('threesixty.nominate')}
                </Button>
              </Form.Item>
            </Form>
          )
          : (
            <Button type="primary" shape="circle" icon="plus" size="large" onClick={showForm} />
          )}
        <Row type="flex" justify="end" gutter={8}>
          {isSelf && canSendRequestApprovalEmail && (
          <Col>
            <Button type="link" onClick={handleRequestApproval}>
              <Icon type="team" />
              {I18n.t('threesixty.email_approve_request')}
            </Button>
          </Col>
          )}
          <Col>
            <Button type="primary" onClick={handleSendEvaluatorReminder}>
              <Icon type="team" />
              {I18n.t('threesixty.remind_all')}
            </Button>
          </Col>
          {isSelf || (
          <>
            <div className="divider" />
            <Col>
              <Button type="primary">
                {I18n.t('threesixty.approve_all')}
              </Button>
            </Col>
            <Col>
              <Button type="danger" className="deny-button">
                {I18n.t('threesixty.deny_all')}
              </Button>
            </Col>
          </>
          )}
        </Row>
      </div>

    </div>
  )
}
