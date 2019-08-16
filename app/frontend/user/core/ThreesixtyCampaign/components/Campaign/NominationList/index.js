/* eslint-disable react/no-danger */
import React, { useState } from 'react'
import {
  List, Collapse, Icon, Progress, Modal, Tooltip,
} from 'antd'
import { Link } from 'react-router-dom'
import _ from 'lodash'
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
      <Tooltip placement="topLeft" title={item.user.email}>
        {userPresenter.selfUserName(item)}
      </Tooltip>
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
  nominations, options, percent, nominationsCounters,
}) {
  const [showHelp, setShowHelp] = useState(false)

  const selfNominations = _.filter(nominations, ({ isSelf }) => isSelf)
  const notSelfNominations = _.filter(nominations, ({ isSelf }) => !isSelf)

  const viewableNominations = (function () {
    if (options.manager.canApproveNominations) { return [] }

    return notSelfNominations
  }())

  const nominationsForSetup = (function () {
    if (options.subject.canNominateEvaluators && options.manager.canChooseEvaluators) {
      return nominations
    }

    if (options.subject.canNominateEvaluators) {
      return selfNominations
    }

    if (options.manager.canChooseEvaluators) {
      return notSelfNominations
    }

    return []
  }())

  const approvableNominations = (function () {
    if (options.manager.canApproveNominations) { return notSelfNominations }

    return []
  }())

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
                {nominationsCounters.completedNominations}
                {' '}
of
                {' '}
                {nominationsCounters.totalNominations}
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
      {nominationsForSetup.length > 0
        && <CollapseItem key="nominations" title={I18n.t('threesixty.setup_nominations')} list={nominationsForSetup} />}
      {viewableNominations.length > 0
        && <CollapseItem key="nominations" title={I18n.t('threesixty.view_nominations')} list={viewableNominations} />}
      {approvableNominations.length > 0
        && (
        <CollapseItem
          key="approve_nominations"
          title={I18n.t('threesixty.approve_nominations')}
          list={approvableNominations}
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
