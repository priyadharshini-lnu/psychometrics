import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Menu, Dropdown, List, Collapse, Progress, Modal, Tooltip,
} from 'antd'
import {
  CheckSquareFilled, InfoCircleOutlined, QuestionCircleOutlined, EllipsisOutlined, DownOutlined,
} from '@ant-design/icons'
import { SafeHTML } from 'components/SafeHTML'
import userPresenter from 'presenters/user'
import WizardIsRequired from 'modules/user/core/WizardIsRequired'
import { STATUSES } from 'constants/userResult'
import EditEvaluationModal from '../EditEvaluationModal'
import connect from './connect'
import styles from './styles.scss'

const { Panel } = Collapse


function EvaluationList ({
  evaluations, managedSubjects, declineEvaluation, options, history, percent, evaluationsCounters,
  instructions,
}) {
  const [showHelp, setShowHelp] = useState(false)
  const [editModal, setEditModal] = useState(null)
  const isEvaluationCompleted = item => item.status === STATUSES.COMPLETED
  const evaluationHelp = _.find(instructions, { name: 'evaluation_help' })
  const canNotEvaluate = (item) => {
    if (item.subjectEvaluationClosed) { return true }

    return options.global.canNotEditEvaluation && isEvaluationCompleted(item)
  }

  const menu = item => (
    <Menu>
      {!isEvaluationCompleted(item)
        && (
        <Menu.Item
          key="0"
          onClick={({ domEvent }) => {
            domEvent.stopPropagation()
            declineEvaluation(item.campaignId, item.id)
          }}
        >
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
            // eslint-disable-next-line max-len
            history.push(`/threesixty_campaigns/${subject.campaignId}/evaluations/${evaluator.id}?approve_evaluation=true&step=0`)
          }}
        >
          {userPresenter.getFullNameWithEmail(evaluator.user)}
        </Menu.Item>
      ))}
    </Menu>
  )

  const showDeclineEvaluationDropdown = item => (
    options.evaluator.canDeclineNomination && !item.subjectEvaluationClosed && !item.isSelf
      && !isEvaluationCompleted(item)
  )

  const getPath = (item) => {
    if (!isEvaluationCompleted(item) && WizardIsRequired.run(item.assessmentExtra)) {
      return `/system_checks/${item.assessmentId}/${item.id}`
    }
    return `/threesixty_campaigns/${item.campaignId}/evaluations/${item.id}?edit=${isEvaluationCompleted(item)}`
  }

  const handleAssessmentLinkClick = (e, item) => {
    if (isEvaluationCompleted(item)) {
      setEditModal(item)
      e.preventDefault()
    }
  }

  const EvaluationItem = (item) => {
    const subjectEvaluationClosed = item?.subjectEvaluationClosed ?? false
    const email = item?.subject?.email ?? ''
    const subject = item?.subject ?? { firstName: '', lastName: '' }

    return (
      <List.Item>
        <div className="evaluation-item list-item">
          {isEvaluationCompleted(item)
            ? <a><CheckSquareFilled className="status-icon" /></a>
            : <div className="empty-square" />}
          {' '}
          <Link
            to={getPath(item)}
            style={{ display: 'flex', flex: 1 }}
            disabled={canNotEvaluate(item)}
            onClick={e => handleAssessmentLinkClick(e, item)}
          >
            <Tooltip placement="topLeft" title={email}>
              <div className={styles.flex}>{userPresenter.selfUserName(item, subject)}</div>
            </Tooltip>
          </Link>

          {subjectEvaluationClosed && (
          <Tooltip placement="top" title={I18n.t('threesixty.evaluation_closed_message')}>
            <InfoCircleOutlined />
          </Tooltip>
          )}

          {showDeclineEvaluationDropdown(item)
          && (
            <Dropdown overlay={() => menu(item)} trigger={['click']} placement="bottomRight">
              <a className="ant-dropdown-link actions-btn" href="#" style={{ flex: 'none' }}>
                <EllipsisOutlined className="menu-icon" />
              </a>
            </Dropdown>
          )
        }
        </div>
      </List.Item>
    )
  }

  const SubjectItem = item => (
    <List.Item>
      <div className="evaluation-item list-item">
        <Dropdown overlay={() => evaluatorsList(item)} trigger={['click']} placement="bottomRight">
          <a className="ant-dropdown-link actions-btn" href="#">
            <Tooltip placement="topLeft" title={item?.user?.email ?? ''}>
              <div className={styles.flex}>{userPresenter.selfUserName(item)}</div>
            </Tooltip>
            <DownOutlined className="menu-icon" />
          </a>
        </Dropdown>
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
          className="approve-list"
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
          <div className="letter-icon">{I18n.t('threesixty.evaluations')[0].toUpperCase()}</div>
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
                {I18n.t('threesixty.progress_text', {
                  completed: evaluationsCounters.completedEvaluations,
                  total: evaluationsCounters.totalEvaluations,
                })}
              </div>
            </div>
          </div>
          {evaluationHelp && (
          <div className="help">
            <QuestionCircleOutlined className="help-icon" onClick={() => setShowHelp(true)} />
          </div>
          )}
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
      <EditEvaluationModal
        show={!!editModal}
        evaluation={editModal}
        close={() => setEditModal(null)}
      />
      {evaluationHelp && (
      <Modal
        title={(
          <div className="help-modal-header">
            <div className="letter-icon">{I18n.t('threesixty.evaluations')[0].toUpperCase()}</div>
            {I18n.t('threesixty.evaluation_help_modal.title')}
          </div>
        )}
        visible={showHelp}
        onCancel={() => setShowHelp(false)}
        footer={null}
      >
        <SafeHTML html={evaluationHelp.content} />
      </Modal>
      )}
    </List>
  )
}

export default connect(EvaluationList)
