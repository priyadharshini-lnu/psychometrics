import React from 'react'
import {
  FileAddOutlined, HistoryOutlined, CheckCircleOutlined,
} from '@ant-design/icons'
import Timer from 'modules/user/modules/campaigns/components/Timer'

export default function Header ({
  currentUser,
  campaignUser: {
    startedAt,
    additionalTime,
    completionStatus,
  },
  counters,
  showTimer,
  duration,
  onFinish,
}) {
  const deadline = new Date(startedAt)
  deadline.setMinutes(deadline.getMinutes(startedAt) + duration)

  let background = 'white'
  if (deadline < new Date()) background = 'danger'

  return (
    <div className="campaign-header">
      <div className="left">
        <h2>
          {I18n.t('campaign.welcome')}
          {' '}
          {currentUser.fullName}
          !
        </h2>
        {showTimer && (
          <div className="timer">
            <Timer
              preview={{ expiryDate: deadline, timerDuration: duration }}
              onFinish={onFinish}
              background={background}
            />
            <span className="mls">{I18n.t('campaign.timer.message')}</span>
          </div>
        )}
      </div>
      <div className="right-wrapper">
        <div className="right">
          <div className="item">
            <div className="icon">
              <FileAddOutlined />
            </div>
            <div className="number">{counters.not_started || 0}</div>
            <div className="label">{I18n.t('campaign.new')}</div>
          </div>
          <div className="divider" />
          <div className="item">
            <div className="icon">
              <HistoryOutlined />
            </div>
            <div className="number">{counters.in_progress || 0}</div>
            <div className="label">{I18n.t('campaign.in_progress')}</div>
          </div>
          <div className="divider" />
          <div className="item">
            <div className="icon">
              <CheckCircleOutlined />
            </div>
            <div className="number">{counters.completed || 0}</div>
            <div className="label">{I18n.t('campaign.completed')}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
