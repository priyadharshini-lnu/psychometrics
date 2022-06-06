import React, { useState } from 'react'
import {
  Row, Col, Card, Progress, Tag, Tooltip,
} from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'
import truncate from 'lodash/truncate'
import cs from 'classnames'

import routeUtils from 'utils/route'
import WizardIsRequired from 'modules/user/core/WizardIsRequired'

import { History } from 'history'
import { UserAssessment } from 'modules/user/modules/campaigns/core/userAssessment/interfaces'

import { ASSESSMENT_TITLE_MAX_LENGTH } from 'modules/user/modules/campaigns/common/assessments'

import PrivacyModal from '../PrivacyModal'
import TimingModal from '../TimingModal'
import AssessmentCard from '../AssessmentCard'
import LanguageModal from '../LanguageModal'
import AssessmentActionBtn from './AssessmentActionBtn'

import '../styles.less'

const { I18n } = window

const ASSESSMENT_CATEGORY_ICONS = {
  psychometric: 'assessment',
  360: '360',
  hogan: 'hogan',
  mindmill: 'mindmill',
  case_study: 'case_study',
  organisational: 'survey',
  agile: 'agile',
  saville: 'saville',
}

interface Props {
  userAssessment: UserAssessment
  acceptPolicy(): Promise<unknown>
  history: History
  size: number
  withSidebar: boolean
  disabled: boolean
  isPartOfTimedCampaign: boolean
  campaignExpiryDate: string
}

const InternalAssessment: React.FC<Props> = ({
  userAssessment, acceptPolicy, history, size, disabled, isPartOfTimedCampaign, campaignExpiryDate, withSidebar,
}) => {
  const [showConfirm, setShowConfirm] = useState(false)
  const [showLang, setShowLang] = useState(false)
  const [showTimingConfirmation, setShowTimingConfirmation] = useState(false)
  const [loading, setLoading] = useState(false)

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

  const { assessmentIconUrl: iconUrl } = userAssessment

  return (
    <AssessmentCard size={size} withSidebar={withSidebar}>
      <Card
        bodyStyle={{ padding: 0 }}
        hoverable
        cover={(
          <div className="internal-cover">
            <div className="internal-caption">
              <div className={cs({ 'internal-icon': true, 'internal-icon-image': !!iconUrl })}>
                {
                  iconUrl
                    ? <img src={iconUrl} />
                    : <span className={`icon-${ASSESSMENT_CATEGORY_ICONS[userAssessment.assessmentCategory]}`} />
                }
              </div>
              {!['completed', 'ineligible', 'timed_out'].includes(userAssessment.status) && (
                <div>
                  <Tag
                    color={userAssessment.status === 'not_started' ? 'green' : 'blue'}
                    style={{ background: 'transparent' }}
                  >
                    {I18n.t(`campaign.${userAssessment.status}`)}
                  </Tag>
                </div>
              )}
            </div>
          </div>
        )}
      >
        <div className="card-body">
          <div className="card-content">
            <div className="card-title">
              <Tooltip title={userAssessment.assessmentName} placement="bottom">
                <span>
                  {truncate(userAssessment.assessmentName, { length: ASSESSMENT_TITLE_MAX_LENGTH })}
                </span>
              </Tooltip>
            </div>
            <Row className="info-line">
              <Col className="info-block">
                <ClockCircleOutlined />
                {' '}
                {userAssessment.timing}
              </Col>
            </Row>
            <div className="card-progress">
              <Progress
                percent={userAssessment.completionPercent || 0}
                strokeWidth={5}
                strokeColor={['completed', 'ineligible'].includes(userAssessment.status) ? '#4eada7' : '#aaa'}
              />
            </div>
            <div className="button">
              <AssessmentActionBtn
                userAssessment={userAssessment}
                setShowConfirm={setShowConfirm}
                setShowTimingConfirmation={setShowTimingConfirmation}
                loading={loading}
                loadAssessmentOrCheckingWizard={loadAssessmentOrCheckingWizard}
                disabled={disabled}
                isPartOfTimedCampaign={isPartOfTimedCampaign}
                campaignExpiryDate={campaignExpiryDate}
              />
            </div>
          </div>
        </div>
      </Card>
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
    </AssessmentCard>
  )
}

export default InternalAssessment
