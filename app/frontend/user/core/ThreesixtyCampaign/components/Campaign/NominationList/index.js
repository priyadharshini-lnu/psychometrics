/* eslint-disable react/no-danger */
import React, { useState } from 'react'
import {
  List, Collapse, Icon, Progress, Modal,
} from 'antd'
import { Link } from 'react-router-dom'
import userPresenter from 'presenters/userPresenter'
import './styles.scss'
import connect from './connect'

const { Panel } = Collapse

const NominationItem = item => (
  <List.Item className="list-item">
    <Link to={`/campaigns/${item.campaignId}/nominations/${item.id}`} style={{ display: 'flex', alignItems: 'center' }}>
      {!item.approved
        ? <Icon type="check-square" theme="filled" className="status-icon" />
        : <div className="empty-square" />}
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
        dataSource={list}
        renderItem={NominationItem}
      />
    </Panel>
  </Collapse>
)

function NominationList ({
  nominations, approvalNominations, options, percent, nominationsCounters
}) {
  const [showHelp, setShowHelp] = useState(false)
  return (
    <List
      className="nominations-list column-list"
      size="large"
      header={(
        <div className="header">
          <div className="letter-icon">N</div>
          <div className="caption">
            {I18n.t('threesixty.nominations')}
            <div className="progress-bars">
              <Progress
                className="progress-line"
                percent={percent}
                showInfo={false}
                strokeColor="#00B4AA"
              />
              <div className="value">
                {nominationsCounters.completedNominations} of {nominationsCounters.totalNominations}
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
      <CollapseItem key="nominations" title={I18n.t('threesixty.setup_nominations')} list={nominations} />
      {options.manager.canApproveNominations && approvalNominations.length > 0
        && (
        <CollapseItem
          key="approve_nominations"
          title={I18n.t('threesixty.approve_nominations')}
          list={approvalNominations}
        />
        )}
      <Modal
        title={(
          <div className="help-modal-header">
            <div className="letter-icon">N</div>
            Nominations help
          </div>
        )}
        visible={showHelp}
        onCancel={() => setShowHelp(false)}
        footer={null}
      >
        <div className="help-modal-body" dangerouslySetInnerHTML={{ __html: I18n.t('threesixty.help.nomination') }} />
      </Modal>
    </List>
  )
}
export default connect(NominationList)
