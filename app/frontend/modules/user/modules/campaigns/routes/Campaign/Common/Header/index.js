import React from 'react'
import {
  FileAddOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import { Space } from 'antd'

import { Timer, StaticTime } from 'modules/user/modules/campaigns/components/Timer'
import { secondsLeftFromNow } from 'utils/time'

const DAY_IN_SECONDS = 24 * 60 * 60

export default function Header ({
  currentUser,
  expiryDate,
  counters,
  showTimer,
  onFinish,
}) {
  return (
    <div className="campaign-header">
      <div className="left">
        <h2>
          {I18n.t('campaign.welcome')}
          {' '}
          {currentUser.fullName}
          !
        </h2>
        <TimerSection
          showTimer={showTimer}
          onFinish={onFinish}
          expiryDate={expiryDate}
        />
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

export const TimerSection = ({ showTimer, onFinish, expiryDate }) => {
  const isLessThanDaysTimeRemaining = expiryDate && secondsLeftFromNow(expiryDate) < DAY_IN_SECONDS

  if (showTimer && isLessThanDaysTimeRemaining) {
    return (
      <Space className="timer" align="baseline">
        <Timer
          seconds={secondsLeftFromNow(expiryDate)}
          onFinish={onFinish}
          background="white"
        />
        {expiryDate && (
          <span>{I18n.t('campaign.timer.message')}</span>
        )}
      </Space>
    )
  }

  if (showTimer && expiryDate) {
    return (
      <Space className="timer" align="baseline">
        <StaticTime background="white" expiryDate={expiryDate} />
        <span>{I18n.t('campaign.timer.expiry_message')}</span>
      </Space>
    )
  }

  return null
}
