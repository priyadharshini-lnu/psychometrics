import React, { useState } from 'react'
import {
  Typography, Avatar, Row, Col,
} from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'
import truncate from 'lodash/truncate'
import { DetailsCard } from 'glint'

import routeUtils from 'utils/route'
import WizardIsRequired from 'modules/user/core/WizardIsRequired'

import { History } from 'history'
import { UserAssessment } from 'modules/user/modules/campaigns/core/userAssessment/interfaces'

import { ASSESSMENT_TITLE_MAX_LENGTH } from 'modules/user/modules/campaigns/common/assessments'

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
  history: History
  isPartOfTimedCampaign: boolean
  campaignExpiryDate: string
  view: string
}

const InternalAssessment: React.FC<Props> = ({
  userAssessment,
  acceptPolicy,
  history,
  view,
  isPartOfTimedCampaign,
  campaignExpiryDate,
}) => {
  let taskStatus = userAssessment.status
  const [showConfirm, setShowConfirm] = useState(false)
  const [showLang, setShowLang] = useState(false)
  const [showTimingConfirmation, setShowTimingConfirmation] = useState(false)

  const loadAssessment = ({ url, mindmill, mindmillUrl }, lang) => {
    const href = mindmill ? mindmillUrl : url

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

  const { assessmentIconUrl: iconUrl } = userAssessment
  const assessmentIcon = iconUrl ? (
    <Avatar src={iconUrl} />
  ) : (
    <Avatar
      className={styles.titleAvatar}
    >
      {userAssessment.assessmentName.substring(0, 2)}
    </Avatar>
  )
  const assessmentTitle = view === 'list'
    ? userAssessment.assessmentName
    : truncate(userAssessment.assessmentName, { length: ASSESSMENT_TITLE_MAX_LENGTH })

  if (userAssessment.completionPercent === 100) {
    taskStatus = 'completed'
  }
  const statusElement = <StatusText taskStatus={taskStatus} />
  const titleElement = (
    <Row wrap={false}>
      <Col>{assessmentIcon}</Col>
      <Col className={styles.assessmentLabel}>{assessmentTitle}</Col>
    </Row>
  )

  return (
    <>
      <DetailsCard
        buttonText={I18n.t('assessments.instructions.begin_assessment')}
        status={statusElement}
        showStatusAtTop={view === 'list'}
        title={titleElement}
        progressPercentage={userAssessment.completionPercent || 0}
        subtitle={(
          <>
            {userAssessment.timing && (
              <div>
                <ClockCircleOutlined />
                <Text type="secondary">
                  {' '}
                  {userAssessment.timing}
                </Text>
              </div>
            )}
          </>
      )}
      />
      {userAssessment.needConfirm
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

export default InternalAssessment
