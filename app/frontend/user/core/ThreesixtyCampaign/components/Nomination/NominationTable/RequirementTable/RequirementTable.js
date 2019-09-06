import React, { useState } from 'react'
import {
  Table, Dropdown, Menu, Icon, Button, Row, Popconfirm,
} from 'antd'
import _ from 'lodash'
import userPresenter from 'presenters/userPresenter'
import statusPresenter from 'presenters/statusPresenter'
import conditionPresenter from 'presenters/conditionPresenter'
import './styles.scss'
import { EVALUATOR_NOMINATION_STATUSES } from 'constants/participantStatuses'
import InlineInput from '../InlineInput'

const { Column } = Table

export default function RequirementTable (props) {
  const {
    removeNomination, updateStatus,
    match,
    nomination: { isSelf, options },
    canNominate,
    requirement: { condition, title, evaluators },
    match: { params: { campaignId, id: nominationId } },
  } = props

  const [showForm, setShowForm] = useState(false)

  const StatusMenu = evaluator => (
    <Menu onClick={(e) => {
      updateStatus({
        campaignId, nominationId, evaluatorId: evaluator.id, status: e.key,
      })
    }}
    >
      <Menu.Item key="approved">
        {I18n.t('threesixty.approved')}
      </Menu.Item>
      <Menu.Item key="waiting">
        {I18n.t('threesixty.waiting')}
      </Menu.Item>
      <Menu.Item key="denied">
        {I18n.t('threesixty.denied')}
      </Menu.Item>
    </Menu>
  )

  const renderRequirementCell = (value) => {
    if (value.evaluator) {
      return {
        children: userPresenter.getFullNameWithEmail(value.evaluator),
      }
    }

    return {
      children: <InlineInput
        title={title}
        match={match}
        relationship={condition.relationshipId}
        {...props}
        hideForm={() => { setShowForm(false) }}
      />,
      props: { colSpan: 4 },
    }
  }

  const renderApprovalStatus = (evaluator) => {
    if (evaluator.id === 'form') { return { props: { colSpan: 0 } } }
    if (!evaluator) { return { props: { colSpan: 0 } } }
    if (evaluator.evaluatorNominationStatus === EVALUATOR_NOMINATION_STATUSES.DECLINED) {
      return { children: 'Declined' }
    }
    if (isSelf) {
      return { children: evaluator && statusPresenter.getApprovalStatus(evaluator.approvalStatus) }
    }

    if (!options.participants.manager.canApproveNominations) {
      return { children: '' }
    }

    if (evaluator.approvalStatus !== 'waiting') {
      return (
        <Dropdown
          trigger={['click']}
          overlay={() => StatusMenu(evaluator)}
        >
          <div>
            { statusPresenter.getApprovalStatus(evaluator.approvalStatus) }
            <Icon type="down" />
          </div>
        </Dropdown>
      )
    }

    return (
      <Row type="flex" className="approve-buttons">
        <Button
          size="small"
          type="primary"
          onClick={() => updateStatus({
            campaignId, nominationId, evaluatorId: evaluator.id, status: 'approved',
          })}
        >
          Approve
        </Button>
        <Button
          size="small"
          type="danger"
          className="deny-button"
          onClick={() => updateStatus({
            campaignId, nominationId, evaluatorId: evaluator.id, status: 'denied',
          })}
        >
          Deny
        </Button>
      </Row>
    )
  }

  const renderStatus = ({ evaluator, evaluatorNominationStatus }) => {
    if (!evaluator) { return { props: { colSpan: 0 } } }
    return {
      children: (
        <div className="status-with-icon">
          {evaluatorNominationStatus === 'completed'
            ? <Icon type="check" />
            : <Icon type="sync" /> }
          {statusPresenter.getStatus(evaluatorNominationStatus)}
        </div>),
    }
  }

  // eslint-disable-next-line no-mixed-operators
  const rowData = evaluators && [...evaluators] || []
  if (showForm) {
    rowData.push({ id: 'form' })
  }

  let canAdd = canNominate
  if (options.participants.subject.limitRelationshipThatSubjectCanSelect) {
    canAdd = canAdd && _.get(options, ['participants', 'subject', 'canSelectRelationships', condition.relationshipId])
  }

  if (evaluators && condition.comparator !== 'atleast' && condition.value && evaluators.length === +condition.value) {
    canAdd = false
  }

  return (
    <div className="requirement">
      <Table
        className="requirement-table"
        rowKey="id"
        dataSource={rowData}
        pagination={false}
        rowClassName="evaluator-row"
      >
        <Column
          width="50%"
          className="column-header condition-header"
          title={(
            <div className="table-head-title">
              <span>{title}</span>
              {!condition.withoutConditions && conditionPresenter.getCondition(condition)}
            </div>
          )}
          key="title"
          render={renderRequirementCell}
        />
        <Column
          className="column-header"
          title={<div className="table-head-title">{I18n.t('threesixty.evaluation')}</div>}
          render={renderStatus}
          key="evaluatorNominationStatus"
        />
        <Column
          className="column-header"
          title={<div className="table-head-title">{I18n.t('threesixty.nomination')}</div>}
          render={renderApprovalStatus}
          key="status"
        />
        <Column
          width="5%"
          className="column-header"
          render={(value) => {
            if (!value.evaluator) { return { props: { colSpan: 0 } } }
            return (
              <Popconfirm
                title={I18n.t('threesixty.confirmation_for_nomination_removal')}
                onConfirm={() => removeNomination({ campaignId, nominationId, evaluator: value })}
              >
                <Icon type="close" />
              </Popconfirm>
            )
          }}
        />
      </Table>
      {canAdd && (
      <Row type="flex" justify="end" style={{ marginTop: 8 }}>
        <Button type="link" onClick={() => setShowForm(true)} disabled={showForm}>
          <Icon type="plus" />
          {' '}
          {I18n.t('threesixty.add')}
          {' '}
          {title}
        </Button>
      </Row>
      )}
    </div>
  )
}
