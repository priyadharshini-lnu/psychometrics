/* eslint-disable react/no-danger */
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Menu, Dropdown, List, Collapse, Icon, Progress, Modal, Tooltip,
} from 'antd'
import userPresenter from 'presenters/userPresenter'
import { EVALUATOR_NOMINATION_STATUSES } from 'constants/participantStatuses'
import connect from './connect'
import './styles.scss'

const { Panel } = Collapse


function EvaluationList ({
  evaluations, managedSubjects, declineEvaluation, options, history, percent, evaluationsCounters,
}) {
  const [showHelp, setShowHelp] = useState(false)
  const isEvaluationCompleted = item => item.evaluatorNominationStatus === EVALUATOR_NOMINATION_STATUSES.COMPLETED

  const menu = item => (
    <Menu>
      {!isEvaluationCompleted(item)
        && (
        <Menu.Item key="0" onClick={() => declineEvaluation(item.campaignId, item.id)}>
          {I18n.t('threesixty.decline_invite')}
        </Menu.Item>
        )
      }
    </Menu>
  )

  const evaluatorsList = subject => (
    <Menu>
      {subject.evaluators.map(evaluator => (
        <Menu.Item
          key={evaluator.id}
          onClick={() => {
            history.push(`/campaigns/${subject.campaignId}/evaluations/${evaluator.id}?approveEvaluation=true&step=0`)
          }}
        >
          {userPresenter.getFullNameWithEmail(evaluator.user)}
        </Menu.Item>
      ))}
    </Menu>
  )

  const EvaluationItem = item => (
    <List.Item>
      <div className="evaluation-item list-item">
        <div>
          <Link
            to={`/campaigns/${item.campaignId}/evaluations/${item.id}?edit=${isEvaluationCompleted(item)}`}
            style={{ display: 'flex' }}
          >
            {isEvaluationCompleted(item)
              ? <Icon type="check-square" theme="filled" className="status-icon" />
              : <div className="empty-square" />}
            {' '}

            <Tooltip placement="topLeft" title={item.subject.email}>
              {userPresenter.selfUserName(item, item.subject)}
            </Tooltip>
            {options.evaluator.canDeclineNomination && !item.isSelf && !isEvaluationCompleted(item)
                && (
                  <Dropdown overlay={() => menu(item)} trigger={['click']}>
                    <a className="ant-dropdown-link actions-btn" href="#">
                      <Icon type="down" className="menu-icon" />
                    </a>
                  </Dropdown>
                )
            }
          </Link>
        </div>

      </div>
    </List.Item>
  )

  const SubjectItem = item => (
    <List.Item>
      <div className="evaluation-item list-item">
        <div>
          <Dropdown overlay={() => evaluatorsList(item)} trigger={['click']}>
            <a className="ant-dropdown-link actions-btn" href="#">
              <Tooltip placement="topLeft" title={item.user.email}>
                {userPresenter.selfUserName(item)}
              </Tooltip>
              <Icon type="down" className="menu-icon" />
            </a>
          </Dropdown>
        </div>
      </div>
    </List.Item>
  )

  const CollapseItem = ({ title, list }) => (
    <Collapse bordered={false} defaultActiveKey="panel">
      <Panel header={<div className="panel-header">{title}</div>} key="panel">
        <List
          size="large"
          dataSource={list}
          renderItem={EvaluationItem}
        />
      </Panel>
    </Collapse>
  )

  const ManagedList = ({ title, list }) => (
    <Collapse bordered={false} defaultActiveKey="panel">
      <Panel header={<div className="panel-header">{title}</div>} key="panel">
        <List
          size="large"
          dataSource={list}
          renderItem={SubjectItem}
        />
      </Panel>
    </Collapse>
  )

  return (
    <List
      size="large"
      className="column-list evaluations-list"
      header={(
        <div className="header">
          <div className="letter-icon">E</div>
          <div className="caption">
            {I18n.t('threesixty.evaluations')}
            <div className="progress-bars">
              <Progress
                className="progress-line"
                percent={percent}
                showInfo={false}
                strokeColor="#00B4AA"
              />
              <div className="value">
                {evaluationsCounters.completedEvaluations}
                {' '}
of
                {' '}
                {evaluationsCounters.totalEvaluations}
              </div>
            </div>
          </div>
          <div className="help">
            <Icon type="question-circle" className="help-icon" onClick={() => setShowHelp(true)} />
          </div>
        </div>
      )}
      bordered
    >
      {!evaluations.length || (
      <CollapseItem
        key="evaluations"
        title={<div className="collapse-title">{I18n.t('threesixty.evaluations')}</div>}
        list={evaluations}
      />
      )}
      {options.manager.canApprovesEvaluations && managedSubjects.length > 0
        && (
        <ManagedList
          key="evaluations_approve"
          title={<div className="collapse-title">{I18n.t('threesixty.approve_evaluations')}</div>}
          list={managedSubjects}
        />
        )}
      <Modal
        title={(
          <div className="help-modal-header">
            <div className="letter-icon">E</div>
            Evaluation help
          </div>
        )}
        visible={showHelp}
        onCancel={() => setShowHelp(false)}
        footer={null}
      >
        <div className="help-modal-body" dangerouslySetInnerHTML={{ __html: I18n.t('threesixty.helps.evaluation') }} />
      </Modal>
    </List>
  )
}

export default connect(EvaluationList)
