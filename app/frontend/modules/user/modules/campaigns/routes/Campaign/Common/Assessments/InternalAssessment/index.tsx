import React, { useState } from 'react'
import {
  Row, Col, Card, Progress, Tag,
} from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'
import routeUtils from 'utils/route'
import WizardIsRequired from 'modules/user/core/WizardIsRequired'
import '../styles.scss'
import { UserAssessment } from 'modules/user/modules/campaigns/core/userAssessment/interfaces'
import { History } from 'history'
import _ from 'lodash'
import PrivacyModal from '../PrivacyModal'
import TimingModal from '../TimingModal'
import AssessmentCard from '../AssessmentCard'
import LanguageModal from '../LanguageModal'
import AssessmentActionBtn from './AssessmentActionBtn'

const { I18n } = window

const ASSESSMENT_CATEGORY_ICONS = {
  psychometric: 'assessment',
  360: '360',
  hogan: 'hogan',
  mindmill: 'mindmill',
  case_study: 'case_study',
  organisational: 'survey',
  agile: 'agile',
}

interface Props {
  userAssessment: UserAssessment
  acceptPolicy(): Promise<unknown>
  history: History
  size: number
  withSidebar: boolean
  disabled: boolean
  disabledReason: string
  timer: {
    fixedTime: boolean
    campaignDuration: number
    startedAt: string
  }
}

const InternalAssessment: React.FC<Props> = ({
  userAssessment, acceptPolicy, history, size, disabled, disabledReason, timer, withSidebar,
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
    location.href = `${href}?lang=${lang}`
  }

  const loadAssessmentOrCheckingWizard = () => {
    if (WizardIsRequired.run(userAssessment.assessmentExtra)) {
      return routeUtils.moveTo(history, '', `/system_checks/${userAssessment.assessmentId}/${userAssessment.id}`)
    }
    if (!userAssessment.selectedLocale && !_.includes(userAssessment.availableLocales, I18n.currentLocale())) {
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

  return (
    <AssessmentCard size={size} withSidebar={withSidebar}>
      <Card
        bodyStyle={{ padding: 0 }}
        hoverable
        cover={(
          <div className="internal-cover">
            <div className="internal-caption">
              <div className="internal-icon">
                <span className={`icon-${ASSESSMENT_CATEGORY_ICONS[userAssessment.assessmentCategory]}`} />
              </div>
              {userAssessment.status !== 'completed' && (
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
              {userAssessment.assessmentName}
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
                strokeColor={userAssessment.status === 'completed' ? '#4eada7' : '#aaa'}
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
                disabledReason={disabledReason}
                timer={timer}
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
      {timer.fixedTime && showTimingConfirmation && (
        <TimingModal
          ok={startAssessment}
          show={showTimingConfirmation}
          close={() => setShowTimingConfirmation(false)}
          assessmentName={userAssessment.assessmentName}
          assessmentTime={(userAssessment.assessmentExtra.timer || 0) / 60}
          timer={timer}
        />
      )}
    </AssessmentCard>
  )
}

export default InternalAssessment
