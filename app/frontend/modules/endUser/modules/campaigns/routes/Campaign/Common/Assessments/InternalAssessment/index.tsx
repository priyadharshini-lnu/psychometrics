import React, { useState } from 'react'
import { Avatar, Row, Col } from 'antd'
import { DetailsCard } from 'glint'
import { useHistory } from 'react-router-dom'

import routeUtils from 'utils/route'
import WizardIsRequired from 'modules/endUser/core/WizardIsRequired'

import { UserAssessment } from 'modules/endUser/modules/campaigns/core/userAssessment/interfaces'

import { secondsLeftFromNow } from 'utils/time'
import { shortify } from 'utils/string'

import { TimerText } from 'modules/endUser/modules/campaigns/components/TimerText'
import { StatusText } from 'modules/endUser/modules/campaigns/components/StatusText'
import { TruncatedTitle } from 'modules/endUser/modules/campaigns/components/TruncatedTitle'
import { PrivacyModal } from '../PrivacyModal'
import { TimingModal } from '../TimingModal'
import { LanguageModal } from '../LanguageModal'

import styles from './styles.less'

const { I18n } = window

interface Props {
  userAssessment: UserAssessment
  acceptPolicy(): Promise<unknown>
  isPartOfTimedCampaign: boolean
  campaignExpiryDate: string
  view: string
  disabled: boolean
  campaignNotStarted: boolean
  prevCompleted: boolean

}

export const InternalAssessment: React.FC<Props> = ({
  userAssessment,
  acceptPolicy,
  view,
  isPartOfTimedCampaign,
  campaignExpiryDate,
  disabled,
  prevCompleted,
  campaignNotStarted,
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
  let actionDisabledText = ''
  if (!prevCompleted) {
    actionDisabledText = I18n.t('campaign.complete_prev')
  }
  if (campaignNotStarted) {
    actionDisabledText = I18n.t('campaign.begin_campaign_msg')
  }

  const buttonTextData = {
    in_progress: I18n.t('assessments.card_actions.continue'),
    completed: '',
    not_started: I18n.t('assessments.card_actions.begin'),
    timed_out: '',
    interrupted: I18n.t('assessments.card_actions.continue'),
  }

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
      {shortify(assessmentName)}
    </Avatar>
  )

  if (completionPercent === 100) {
    taskStatus = 'completed'
  }
  const statusElement = <StatusText taskStatus={taskStatus} />
  const titleElement = (
    <Row wrap={false}>
      <Col>{assessmentIcon}</Col>
      <Col className={styles.assessmentLabel}>
        <span>
          <TruncatedTitle title={assessmentName} />
        </span>
      </Col>
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
        actionDisabledText={actionDisabledText}
        onButtonClick={status === 'not_started' ? handleBeginAssessment : handleContinueAssessment}
        subtitle={(
          <>
            {timing && <TimerText text={timing} />}
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
