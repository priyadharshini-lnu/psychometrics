import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Menu, Dropdown, List, Collapse, Icon, Progress, Modal,
} from 'antd'
import userPresenter from 'presenters/userPresenter'
import connect from './connect'
import './styles.scss'

const { Panel } = Collapse


function EvaluationList ({
  evaluations, approvalEvaluations, declineEvaluation, options,
}) {
  const [showHelp, setShowHelp] = useState(false)

  const menu = item => (
    <Menu>
      <Menu.Item key="0" onClick={() => declineEvaluation(item.campaignId, item.id)}>
        {I18n.t('threesixty.decline_invite')}
      </Menu.Item>
    </Menu>
  )

  const EvaluationItem = item => (
    <List.Item>
      <div className="evaluation-item list-item">
        <div>
          <Link to={`/campaigns/${item.campaignId}/evaluations/${item.id}`} style={{ display: 'flex' }}>
            {!item.evaluatorNominationStatus === 'completed'
              ? <Icon type="check-square" theme="filled" className="status-icon" />
              : <div className="empty-square" />}
            {' '}
            {userPresenter.selfUserName(item)}
          </Link>
        </div>
        {options.evaluator.canDeclineNomination && !item.isSelf && (
          item.evaluatorNominationStatus === 'denied'
            ? <div>{I18n.t('threesixty.denied')}</div>
            : (
              <Dropdown overlay={() => menu(item)} trigger={['click']}>
                <a className="ant-dropdown-link actions-btn" href="#">
                  <Icon type="down" className="menu-icon" />
                </a>
              </Dropdown>
            )
        )}
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
                percent={30}
                showInfo={false}
                strokeColor="#00B4AA"
              />
              <div className="value">1 of 3</div>
            </div>
          </div>
          <div className="help">
            <Icon type="question-circle" className="help-icon" onClick={() => setShowHelp(true)} />
          </div>
        </div>
      )}
      bordered
    >
      <CollapseItem
        key="evaluations"
        title={<div className="collapse-title">{I18n.t('threesixty.evaluations')}</div>}
        list={evaluations}
      />
      {options.manager.canApprovesEvaluations
        && (
        <CollapseItem
          key="evaluations_approve"
          title={<div className="collapse-title">{I18n.t('threesixty.approve_evaluations')}</div>}
          list={approvalEvaluations}
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
        <p>need contents...</p>
      </Modal>
    </List>
  )
}

export default connect(EvaluationList)
