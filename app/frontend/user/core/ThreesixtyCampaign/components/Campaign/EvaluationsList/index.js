import React from 'react'
import { Link } from 'react-router-dom'
import {
  Menu, Dropdown, List, Collapse, Icon,
} from 'antd'
import userPresenter from 'presenters/userPresenter'
import connect from './connect'
import './EvaluationsList.scss'

const { Panel } = Collapse

const menu = item => (
  <Menu>
    <Menu.Item key="0">
      <Link to={`/campaigns/${item.campaignId}/evaluations/${item.id}`}>
        Edit Evaluation
      </Link>
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
          {item.isSelf ? 'Yourself' : userPresenter.getFullName(item.user)}
        </Link>
      </div>
      {item.completed && (
        <Dropdown overlay={() => menu(item)} trigger={['click']}>
          <a className="ant-dropdown-link" href="#">
            Actions
            {' '}
            <Icon type="down" className="menu-icon" />
          </a>
        </Dropdown>
      )}
    </div>
  </List.Item>
)

const CollapseItem = item => (
  <Collapse bordered={false} defaultActiveKey="panel">
    <Panel header={<div className="panel-header">{item.title}</div>} key="panel">
      <List
        size="large"
        bordered
        dataSource={item.list}
        renderItem={EvaluationItem}
      />
    </Panel>
  </Collapse>
)

function EvaluationsList ({ evaluations }) {
  return (
    <List
      size="large"
      className="evaluations-list"
      header={<div>Evaluations</div>}
      bordered
      dataSource={evaluations}
      renderItem={CollapseItem}
    />
  )
}

export default connect(EvaluationsList)
