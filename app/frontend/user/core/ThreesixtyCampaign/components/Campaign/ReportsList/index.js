import React from 'react'
import { List, Collapse, Icon } from 'antd'

const { Panel } = Collapse

const UserItem = item => (
  <List.Item>
    <Icon type="check-circle" theme="twoTone" twoToneColor={item.approved ? '#52c41a' : '#ccc'} />
    {' '}
    {item.name}
  </List.Item>
)

const CollapseItem = item => (
  <Collapse bordered={false}>
    <Panel header={item.title} forceRender>
      <List
        size="large"
        bordered
        dataSource={item.users}
        renderItem={UserItem}
      />
    </Panel>
  </Collapse>
)

export default function EvaluatorsList ({ reports }) {
  return (
    <List
      size="large"
      header={<div>Reports</div>}
      bordered
      dataSource={reports}
      renderItem={CollapseItem}
    />
  )
}
