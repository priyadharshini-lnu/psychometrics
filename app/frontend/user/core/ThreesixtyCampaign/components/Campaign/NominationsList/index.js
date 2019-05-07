import React from 'react'
import { List, Collapse, Icon } from 'antd'
import { Link } from 'react-router-dom'
import './NominationsList.scss'

const { Panel } = Collapse

const NominationItem = item => (
  <List.Item>
    <Link to={`/campaigns/${item.campaignId}/nominations/${item.id}`}>
      <Icon type="check-circle" theme="twoTone" twoToneColor={item.approved ? '#52c41a' : '#ccc'} />
      {' '}
      {item.isSelf ? 'Yourself' : `${item.user.firstName} ${item.user.lastName}`}
    </Link>
  </List.Item>
)

const CollapseItem = item => (
  <Collapse bordered={false} accordion={false} defaultActiveKey="panel">
    <Panel header={<div className="panel-header">{item.title}</div>} key="panel">
      <List
        size="large"
        bordered
        dataSource={item.list}
        renderItem={NominationItem}
      />
    </Panel>
  </Collapse>
)

export default function EvaluatorsList ({ nominations }) {
  return (
    <List
      className="nominations-list"
      size="large"
      header={<div>Nominations</div>}
      bordered
      dataSource={nominations}
      renderItem={CollapseItem}
    />
  )
}
