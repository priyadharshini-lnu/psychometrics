import React from 'react'
import { List, Collapse, Icon } from 'antd'
import { Link } from 'react-router-dom'
import userPresenter from 'presenters/userPresenter'
import './styles.scss'
import connect from './connect'

const { Panel } = Collapse

const NominationItem = item => (
  <List.Item>
    <Link to={`/campaigns/${item.campaignId}/nominations/${item.id}`}>
      <Icon type="check-circle" theme="twoTone" twoToneColor={item.approved ? '#52c41a' : '#ccc'} />
      {' '}
      {userPresenter.selfUserName(item)}
    </Link>
  </List.Item>
)

const CollapseItem = ({ title, list }) => (
  <Collapse bordered={false} accordion={false} defaultActiveKey="panel">
    <Panel header={<div className="panel-header">{title}</div>} key="panel">
      <List
        size="large"
        bordered
        dataSource={list}
        renderItem={NominationItem}
      />
    </Panel>
  </Collapse>
)

function NominationList ({ nominations, approvalNominations, options }) {
  return (
    <List
      className="nominations-list"
      size="large"
      header={<div>Nominations</div>}
      bordered
    >
      <CollapseItem key="nominations" title="Set up nominations" list={nominations} />
      {options.manager.canApproveNominations && approvalNominations.length > 0
        && <CollapseItem key="approve_nominations" title="Approve nominations" list={approvalNominations} />}
    </List>
  )
}
export default connect(NominationList)
