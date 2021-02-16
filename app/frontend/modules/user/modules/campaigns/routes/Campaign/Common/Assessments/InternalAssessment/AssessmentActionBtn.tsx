import React from 'react'
import { Tooltip } from 'antd'
import {
  CheckOutlined, LoadingOutlined, PlayCircleOutlined,
} from '@ant-design/icons'
import '../styles.scss'
import cs from 'classnames'
import ConditionalWrap from 'conditional-wrap'
import { UserAssessment, Statuses } from 'modules/user/modules/campaigns/core/userAssessment/interfaces'
import { minutesLeftFromNow } from 'utils/time'
import ContinueIcon from '../ContinueIcon'

const { I18n } = window

interface Props {
  userAssessment: UserAssessment
  setShowConfirm(state: boolean): void
  setShowTimingConfirmation(state: boolean): void
  loading: boolean
  loadAssessmentOrCheckingWizard(): void
  disabled: boolean
  timer: {
    fixedTime: boolean
    campaignDuration: number
    startedAt: string
    expiryDate: string
  }
}

const AssessmentActionBtn: React.FC<Props> = ({
  userAssessment: {
    mindmill, mindmillUrl, url, status, needConfirm,
    assessmentExtra: { timer },
  },
  setShowConfirm,
  setShowTimingConfirmation,
  loading,
  loadAssessmentOrCheckingWizard,
  disabled,
  timer: {
    fixedTime, expiryDate,
  },
}) => {
  let href = url
  if (mindmill) { href = mindmillUrl }

  const showPolicyConfirm = (e: React.MouseEvent) => {
    e.preventDefault()

    if (fixedTime && expiryDate) {
      const deltaTime = minutesLeftFromNow(new Date(expiryDate))
      if (deltaTime < (timer || 0) / 60) {
        return setShowTimingConfirmation(true)
      }
    }

    if (needConfirm) return setShowConfirm(true)

    loadAssessmentOrCheckingWizard()
  }

  if (status === Statuses.COMPLETED) {
    return (
      <a>
        <CheckOutlined />
        {' '}
        {I18n.t('threesixty.completed')}
      </a>
    )
  }

  const continueLink = (
    <a href={href} className={cs({ disabled })} onClick={showPolicyConfirm}>
      {loading ? <LoadingOutlined /> : <ContinueIcon disabled={disabled} />}
      {' '}
      {I18n.t('threesixty.continue')}
    </a>
  )

  const beginLink = (
    <a href={href} className={cs({ disabled })} onClick={showPolicyConfirm}>
      {I18n.t('threesixty.begin')}
      {' '}
      {loading ? <LoadingOutlined /> : <PlayCircleOutlined className="rtl-flip" />}
    </a>
  )

  return (
    <ConditionalWrap
      condition={disabled}
      wrap={children => (
        <Tooltip placement="topRight" title={I18n.t('campaign.complete_prev')}>
          <span>
            {children}
          </span>
        </Tooltip>
      )}
    >
      {status === Statuses.NOT_STARTED ? beginLink : continueLink}
    </ConditionalWrap>
  )
}

export default AssessmentActionBtn
