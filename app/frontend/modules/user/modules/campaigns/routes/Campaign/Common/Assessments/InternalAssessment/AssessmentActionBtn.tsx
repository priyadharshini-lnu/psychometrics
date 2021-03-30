import React from 'react'
import { Tooltip } from 'antd'
import {
  CheckOutlined, LoadingOutlined, PlayCircleOutlined, FieldTimeOutlined,
} from '@ant-design/icons'
import '../styles.scss'
import cs from 'classnames'
import ConditionalWrap from 'conditional-wrap'
import { UserAssessment, Statuses } from 'modules/user/modules/campaigns/core/userAssessment/interfaces'
import { secondsLeftFromNow } from 'utils/time'
import ContinueIcon from '../ContinueIcon'

const { I18n } = window

interface Props {
  userAssessment: UserAssessment
  setShowConfirm(state: boolean): void
  setShowTimingConfirmation(state: boolean): void
  loading: boolean
  loadAssessmentOrCheckingWizard(): void
  disabled: boolean
  isPartOfTimedCampaign: boolean
  campaignExpiryDate: string
}

const AssessmentActionBtn: React.FC<Props> = ({
  userAssessment: {
    mindmill, mindmillUrl, url, status, needConfirm,
    assessmentExtra: { timer: totalAssessmentTime },
  },
  setShowConfirm,
  setShowTimingConfirmation,
  loading,
  loadAssessmentOrCheckingWizard,
  disabled,
  isPartOfTimedCampaign,
  campaignExpiryDate,
}) => {
  let href = url
  if (mindmill) { href = mindmillUrl }

  const handleBeginAssessment = (e: React.MouseEvent) => {
    e.preventDefault()

    if (isPartOfTimedCampaign && campaignExpiryDate && totalAssessmentTime) {
      const remainingCampaignTime = secondsLeftFromNow(campaignExpiryDate)
      if (remainingCampaignTime && remainingCampaignTime < totalAssessmentTime) {
        return setShowTimingConfirmation(true)
      }
    }

    if (needConfirm) return setShowConfirm(true)

    loadAssessmentOrCheckingWizard()
  }

  const handleContinueAssessment = (e: React.MouseEvent) => {
    e.preventDefault()

    loadAssessmentOrCheckingWizard()
  }

  if (status === Statuses.TIMED_OUT) {
    return (
      <div>
        <FieldTimeOutlined />
        {' '}
        {I18n.t('threesixty.timed_out')}
      </div>
    )
  }

  if (status === Statuses.COMPLETED || status === Statuses.INELIGIBLE) {
    return (
      <a>
        <CheckOutlined />
        {' '}
        {I18n.t('threesixty.completed')}
      </a>
    )
  }

  const continueLink = (
    <a href={href} className={cs({ disabled })} onClick={handleContinueAssessment}>
      {loading ? <LoadingOutlined /> : <ContinueIcon disabled={disabled} />}
      {' '}
      {I18n.t('threesixty.continue')}
    </a>
  )

  const beginLink = (
    <a href={href} className={cs({ disabled })} onClick={handleBeginAssessment}>
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
