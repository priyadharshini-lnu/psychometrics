import React from 'react'
import { Link } from 'react-router-dom'
import {
  Menu, Dropdown, List, Collapse, Icon,
} from 'antd'
import userPresenter from 'presenters/userPresenter'
import connect from './connect'
import './styles.scss'

const { Panel } = Collapse


function EvaluationList ({
  evaluations, approvalEvaluations, declineEvaluation, options,
}) {
  const menu = item => (
    <Menu>
      <Menu.Item key="0" onClick={() => declineEvaluation(item.campaignId, item.id)}>
        Decline Invite
      </Menu.Item>
    </Menu>
  )

  const EvaluationItem = item => (
    <List.Item>
      <div className="evaluation-item">
        <div>
          <Link to={`/campaigns/${item.campaignId}/evaluations/${item.id}`}>
            <Icon type="check-circle" theme="twoTone" twoToneColor={item.approved ? '#52c41a' : '#ccc'} />
            {' '}
            {userPresenter.selfUserName(item)}
          </Link>
        </div>
        {options.evaluator.canDeclineNomination && (
          item.evaluatorStatus === 'denied'
            ? <div>Denied</div>
            : (
              <Dropdown overlay={() => menu(item)} trigger={['click']}>
                <a className="ant-dropdown-link" href="#">
              Actions
                  {' '}
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
          bordered
          dataSource={list}
          renderItem={EvaluationItem}
        />
      </Panel>
    </Collapse>
  )

  return (
    <List
      size="large"
      className="evaluations-list"
      header={<div>Evaluations</div>}
      bordered
    >
      <CollapseItem key="evaluations" title="Evaluations" list={evaluations} />
      {/* TODO: disabled for the demo, need to implement evaluation approvement */}
      {false && options.manager.canApprovesEvaluations
        && <CollapseItem key="evaluations_approve" title="Approve evaluations" list={approvalEvaluations} />}
    </List>
  )
}

export default connect(EvaluationList)
