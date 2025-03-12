import { Fragment, useState } from 'react'
import _ from 'lodash'
import {
  Typography, Form, Input, Button, Select, Row, Col, AutoComplete, message, Alert,
} from 'antd'
import { useParams } from 'react-router-dom'
import { TeamOutlined, PlusOutlined, CloseOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

import userPresenter from '~/presenters/user'
import { relationshipWithoutSelf } from '~/core/relationship'
import styles from './NominationForm.less'

const { Title } = Typography
const { Option } = Select
const { I18n } = window

export const NominationForm = (props) => {
  const {
    handleAddNomination, searchEvaluators, updateForm, allowedRelationshipsForNewNominations,
    showForm, hideForm, requestApproval, sendEvaluatorReminder, updateAllNominationStatus,
    nomination: {
      isSelf, subject, relationships, form, form: { show }, canSendRequestApprovalEmail, options,
    },
    autocomplete: { users },
    requirements,
  } = props
  const { campaignId, id: nominationId } = useParams() as { campaignId: string, id: string }

  const [requestApprovalButtonDisabled, setRequestApprovalButtonDisabled] = useState(false)

  const handleAdd = () => {
    handleAddNomination({
      campaignId, nominationId, ...form.attrs,
    })
  }

  const handleRequestApproval = () => {
    setRequestApprovalButtonDisabled(true)
    requestApproval(campaignId, nominationId)
      .then(() => message.info(I18n.t('threesixty.approving_mail_sent')))
      .catch(errors => message.error(errors, 15))
  }

  const handleSendEvaluatorReminder = () => {
    sendEvaluatorReminder(campaignId, nominationId)
      .then(() => message.info(I18n.t('threesixty.remind_mail_sent')))
  }

  const handleApproveAll = () => {
    updateAllNominationStatus(campaignId, nominationId, 'approved')
      .then(() => message.info(I18n.t('threesixty.approve_all_successful')))
  }

  const handleDenyAll = () => {
    updateAllNominationStatus(campaignId, nominationId, 'denied')
      .then(() => message.info(I18n.t('threesixty.deny_all_successful')))
  }

  const canAddEvaluators = relationship => _.includes(allowedRelationshipsForNewNominations, relationship)

  const hasEvaluations = _.some(requirements, req => req.evaluators && req.evaluators.length > 0)
  const errors = _.filter(form.errors, (error, key) => (
    !['firstName', 'lastName'].includes(key) && error
  ))

  return (
    <>
      <Row className={styles.titleRow}>
        <Title level={4} className={styles.titleText}>
          {I18n.t('threesixty.nominate_evaluators')}
          {' '}
          {isSelf ? I18n.t('threesixty.yourself') : userPresenter.getFullNameWithEmail(subject)}
        </Title>
        {!show
      && <Button className={styles.addBtn} type="primary" icon={<PlusOutlined />} size="middle" onClick={showForm} />}
      </Row>
      {show
      && (
        <Form layout="inline">
          <Form.Item>
            <Button
              type="primary"
              className={styles.addBtn}
              shape="default"
              icon={<CloseOutlined />}
              size="middle"
              onClick={hideForm}
            />
          </Form.Item>
          <Form.Item>
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
          <Form.Item>
            <Select
              value={form.attrs.relationshipId}
              onChange={relationshipId => updateForm({ ...form.attrs, relationshipId })}
              placeholder={I18n.t('threesixty.select_relationnship')}
              dropdownMatchSelectWidth={false}
            >
              <Option value="" disabled>{I18n.t('threesixty.select_relationnship')}</Option>
              {relationshipWithoutSelf(relationships, options).map(relation => (
                canAddEvaluators(relation) && (
                  <Option
                    key={relation.id}
                    value={relation.id}
                  >
                    {relation.name}
                  </Option>
                )
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button onClick={handleAdd} type="primary">
              {I18n.t('threesixty.nominate')}
            </Button>
          </Form.Item>
        </Form>
      )}
      <div>
        {hasEvaluations && (
          <Row className={styles.btnRow} justify="end" gutter={[8, 8]}>
            {isSelf && canSendRequestApprovalEmail && (
              <Col>
                <Button type="link" onClick={handleRequestApproval} disabled={requestApprovalButtonDisabled}>
                  <TeamOutlined />
                  {I18n.t('threesixty.email_approve_request')}
                </Button>
              </Col>
            )}
            {options.messages.subjectCanSendReminder && (
              <Col>
                <Button type="primary" onClick={handleSendEvaluatorReminder}>
                  <TeamOutlined />
                  {I18n.t('threesixty.remind_all')}
                </Button>
              </Col>
            )}
            {isSelf || !options.participants.manager.canApproveNominations || (
              <Fragment>
                <div className="divider" />
                <Col>
                  <Button type="primary" onClick={handleApproveAll}>
                    {I18n.t('threesixty.approve_all')}
                  </Button>
                </Col>
                <Col>
                  <Button type="primary" danger onClick={handleDenyAll}>
                    {I18n.t('threesixty.deny_all')}
                  </Button>
                </Col>
              </Fragment>
            )}
          </Row>
        )}
      </div>
      {_.some(errors) && (
        <Alert
          message={I18n.t('threesixty.validation_errors')}
          description={_.map(errors, error => (
            <div>{error.join(' ')}</div>
          ))}
          type="error"
        />
      )}

    </>
  )
}
