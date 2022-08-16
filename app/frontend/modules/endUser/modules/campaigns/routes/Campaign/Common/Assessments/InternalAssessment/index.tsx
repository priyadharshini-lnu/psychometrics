import React, { useState } from 'react'
import {
  Typography, Avatar, Row, Col,
} from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'
import truncate from 'lodash/truncate'
import { DetailsCard } from 'glint'
import { useHistory } from 'react-router-dom'

import routeUtils from 'utils/route'
import WizardIsRequired from 'modules/user/core/WizardIsRequired'

import { UserAssessment } from 'modules/user/modules/campaigns/core/userAssessment/interfaces'

import { ASSESSMENT_TITLE_MAX_LENGTH } from 'modules/user/modules/campaigns/common/assessments'
import { secondsLeftFromNow } from 'utils/time'

import { StatusText } from 'modules/endUser/modules/campaigns/components/StatusText'
import { PrivacyModal } from '../PrivacyModal'
import { TimingModal } from '../TimingModal'
import { LanguageModal } from '../LanguageModal'

import styles from './styles.less'

const { I18n } = window
const { Text } = Typography

interface Props {
  userAssessment: UserAssessment
  acceptPolicy(): Promise<unknown>
  isPartOfTimedCampaign: boolean
  campaignExpiryDate: string
  view: string
  disabled: boolean

}
const buttonTextData = {
  in_progress: 'Continue',
  completed: '',
  not_started: 'Begin',
  timed_out: '',
  interrupted: 'Continue',
}

export const InternalAssessment: React.FC<Props> = ({
  userAssessment,
  acceptPolicy,
  view,
  isPartOfTimedCampaign,
  campaignExpiryDate,
  disabled,
}) => {
  const history = useHistory()
  const {
    status, needConfirm, assessmentIconUrl, assessmentName, completionPercent, timing, assessmentExtra,
  } = userAssessment
  let taskStatus = status
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showLang, setShowLang] = useState(false)
  const [showTimingConfirmation, setShowTimingConfirmation] = useState(false)

  const handleBeginAssessment = () => {
    if (isPartOfTimedCampaign && campaignExpiryDate && assessmentExtra.timer) {
      const remainingCampaignTime = secondsLeftFromNow(campaignExpiryDate)
      if (remainingCampaignTime && remainingCampaignTime < assessmentExtra.timer) {
        return setShowTimingConfirmation(true)
      }
    }

    if (needConfirm) return setShowConfirm(true)

    loadAssessmentOrCheckingWizard()
  }

  const handleContinueAssessment = () => {
    loadAssessmentOrCheckingWizard()
  }

  const loadAssessment = ({
    url, mindmill, mindmillUrl,
  }, lang) => {
    const href = mindmill ? mindmillUrl : url
    setLoading(true)
    const params = new URLSearchParams(`lang=${lang}`)
    location.href = `${href}?${params.toString()}`
  }

  const loadAssessmentOrCheckingWizard = () => {
    if (WizardIsRequired.run(userAssessment.assessmentExtra)) {
      return routeUtils.moveTo(history, '', `/system_checks/${userAssessment.assessmentId}/${userAssessment.id}`)
    }
    if (!userAssessment.selectedLocale && !userAssessment.availableLocales.includes(I18n.currentLocale())) {
      setShowLang(true)
    } else {
      return loadAssessment(userAssessment, userAssessment.selectedLocale || I18n.currentLocale())
    }
  }

  const accept = () => {
    setShowConfirm(false)
    setLoading(true)

    acceptPolicy().then(() => {
      loadAssessmentOrCheckingWizard()
    })
  }

  const selectLang = (lang?: string) => {
    setShowLang(false)
    return loadAssessment(userAssessment, lang || 'en')
  }

  const startAssessment = () => {
    if (userAssessment.needConfirm) {
      setShowConfirm(true)
      setShowTimingConfirmation(false)
    } else {
      setShowTimingConfirmation(false)
      loadAssessmentOrCheckingWizard()
    }
  }

  const iconUrl = assessmentIconUrl
  const assessmentIcon = iconUrl ? (
    <Avatar src={iconUrl} />
  ) : (
    <Avatar
      className={styles.titleAvatar}
    >
      {assessmentName.substring(0, 2)}
    </Avatar>
  )
  const assessmentTitle = view === 'list'
    ? assessmentName
    : truncate(assessmentName, { length: ASSESSMENT_TITLE_MAX_LENGTH })

  if (completionPercent === 100) {
    taskStatus = 'completed'
  }
  const statusElement = <StatusText taskStatus={taskStatus} />
  const titleElement = (
    <Row wrap={false}>
      <Col>{assessmentIcon}</Col>
      <Col className={styles.assessmentLabel}><span>{assessmentTitle}</span></Col>
    </Row>
  )

  return (
    <>
      <DetailsCard
        status={statusElement}
        showStatusAtTop={view === 'list'}
        title={titleElement}
        progressPercentage={completionPercent || 0}
        buttonText={buttonTextData[status]}
        actionDisabled={disabled}
        actionLoading={loading}
        actionDisabledText={I18n.t('campaign.complete_prev')}
        handleButtonClick={status === 'not_started' ? handleBeginAssessment : handleContinueAssessment}
        subtitle={(
          <>
            {timing && (
              <div>
                <ClockCircleOutlined />
                <Text type="secondary">
                  {' '}
                  {timing}
                </Text>
              </div>
            )}
          </>
      )}
      />
      {needConfirm
      && <PrivacyModal accept={accept} show={showConfirm} close={() => setShowConfirm(false)} />}
      <LanguageModal
        locales={userAssessment.availableLocales}
        show={showLang}
        onSelect={selectLang}
        close={() => setShowLang(false)}
      />
      {isPartOfTimedCampaign && showTimingConfirmation && userAssessment.assessmentExtra?.timer && (
      <TimingModal
        ok={startAssessment}
        show={showTimingConfirmation}
        close={() => setShowTimingConfirmation(false)}
        assessmentName={userAssessment.assessmentName}
        totalAssessmentTime={userAssessment.assessmentExtra.timer}
        campaignExpiryDate={campaignExpiryDate}
      />
      )}
    </>
  )
}
