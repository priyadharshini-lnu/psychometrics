import React, { useState } from 'react'
import {
  List, Collapse, Progress, Modal, Tooltip,
} from 'antd'
import { CheckCircleFilled, QuestionCircleOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { SafeHTML } from 'components/SafeHTML'
import _ from 'lodash'
import userPresenter from 'presenters/user'
import './styles.scss'
import connect from './connect'

const { Panel } = Collapse

const NominationItem = (item) => {
  const campaignId = item?.campaignId ?? 0
  const itemId = item?.id ?? 0
  const isNominationCompleted = item?.isNominationCompleted ?? false
  const email = item?.user?.email ?? ''

  return (
    <List.Item className="list-item">
      <Link
        to={`/threesixty_campaigns/${campaignId}/nominations/${itemId}`}
        style={{ display: 'flex', alignItems: 'center' }}
      >
        {isNominationCompleted
          ? <CheckCircleFilled className="status-icon complete" />
          : <CheckCircleFilled className="status-icon" />}
        {' '}
        <Tooltip placement="topLeft" title={email}>
          {userPresenter.selfUserName(item)}
        </Tooltip>
      </Link>
    </List.Item>
  )
}

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
  nominations, options, percent, nominationsCounters, instructions,
}) {
  const [showHelp, setShowHelp] = useState(false)

  const [selfNominations, notSelfNominations] = _.partition(nominations, { isSelf: true })

  const getNominationsForSetup = () => {
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
  }

  const nominationsForSetup = getNominationsForSetup()
  const nominationsForSetupIds = nominationsForSetup.map(({ id }) => id)

  let viewableNominations = !options.manager.canViewNominations
    || options.manager.canApproveNominations ? selfNominations : nominations

  viewableNominations = _.filter(viewableNominations,
    nomination => !_.includes(nominationsForSetupIds, nomination.id))


  const approvableNominations = options.manager.canApproveNominations ? notSelfNominations : []

  const nominationHelp = _.find(instructions, { name: 'nomination_help' })

  return (
    <List
      className="nominations-list column-list"
      size="large"
      header={(
        <div className="header">
          <div className="letter-icon">{I18n.t('threesixty.nominations')[0].toUpperCase()}</div>
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
                {I18n.t('threesixty.progress_text', {
                  completed: nominationsCounters.completedNominations,
                  total: nominationsCounters.totalNominations,
                })}
              </div>
            </div>
          </div>
          {nominationHelp && (
          <div className="help">
            <QuestionCircleOutlined className="help-icon" onClick={() => setShowHelp(true)} />
          </div>
          )}
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
      {nominationHelp && (
      <Modal
        title={(
          <div className="help-modal-header">
            <div className="letter-icon">{I18n.t('threesixty.nominations')[0].toUpperCase()}</div>
            {I18n.t('threesixty.nomination_help_modal.title')}
          </div>
        )}
        visible={showHelp}
        onCancel={() => setShowHelp(false)}
        footer={null}
      >
        <SafeHTML html={nominationHelp.content} />
      </Modal>
      )}
    </List>
  )
}
export default connect(NominationList)
